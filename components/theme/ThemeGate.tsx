"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useTheme, type Theme } from "./ThemeProvider";
import { getLenis } from "../../lib/lenisInstance";

interface ThemeGateProps {
  onSelect?: (theme: Theme) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: [number, number, number];
  isAsh: boolean;
}

/* ================================================================
   WebGL2 Burning-Paper Shader Source
   ================================================================ */
const VS_SOURCE = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FS_SOURCE = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform float uProgress;
uniform float uTime;

// Procedural 2D Value Noise & FBM
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 2.05;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 pixelCoord = gl_FragCoord.xy;
  
  // Calculate maximum distance to screen corners from origin
  vec2 d0 = uOrigin;
  vec2 d1 = uResolution - uOrigin;
  float maxDist = length(max(d0, d1));
  
  // Current front radius expanding with progress
  float currentRadius = uProgress * (maxDist + 160.0);
  float dist = length(pixelCoord - uOrigin);

  // Noise distortion on the burn perimeter
  vec2 noiseCoord = pixelCoord * 0.005;
  float noiseVal = fbm(noiseCoord * 2.8 + vec2(uTime * 0.18, 0.0)) * 70.0 
                 + fbm(noiseCoord * 7.0 - vec2(0.0, uTime * 0.25)) * 24.0;
  float distortedDist = dist - noiseVal;
  float diff = distortedDist - currentRadius;

  // 1. Inside the burnt hole: completely transparent (site revealed)
  if (diff < 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  // Paper base procedural texture
  vec3 paperBase = vec3(0.91, 0.87, 0.79); // warm sepia cream paper
  float paperNoise = fbm(pixelCoord * 0.02) * 0.06;
  vec3 paperCol = paperBase - vec3(paperNoise);

  // Soft edge vignette
  vec2 normCoord = pixelCoord / uResolution;
  float vig = 1.0 - smoothstep(0.45, 1.35, length(normCoord - 0.5) * 1.4);
  paperCol *= mix(0.88, 1.0, vig);

  // 2. Burning rim layers
  // Layer A: White-hot / blazing orange ember line (0px .. 10px)
  if (diff < 10.0) {
    float t = diff / 10.0;
    float flicker = sin(uTime * 28.0 + dist * 0.2) * 0.12 + 0.88;
    vec3 whiteHot = vec3(1.0, 0.96, 0.82) * 1.5;
    vec3 brightOrange = vec3(1.0, 0.50, 0.08) * 1.3;
    vec3 ember = mix(whiteHot, brightOrange, smoothstep(0.0, 0.7, t)) * flicker;
    fragColor = vec4(ember, 1.0);
    return;
  }

  // Layer B: Glowing amber & deep red-orange rim (10px .. 26px)
  if (diff < 26.0) {
    float t = (diff - 10.0) / 16.0;
    vec3 brightOrange = vec3(1.0, 0.50, 0.08) * 1.2;
    vec3 deepAmber = vec3(0.85, 0.32, 0.04);
    vec3 col = mix(brightOrange, deepAmber, smoothstep(0.0, 1.0, t));
    fragColor = vec4(col, 1.0);
    return;
  }

  // Layer C: Charred dark-brown / black scorched paper (26px .. 52px)
  if (diff < 52.0) {
    float t = (diff - 26.0) / 26.0;
    vec3 charCol = vec3(0.10, 0.06, 0.03); // charred espresso black
    vec3 darkScorched = vec3(0.32, 0.22, 0.12);
    vec3 col = mix(charCol, darkScorched, smoothstep(0.0, 1.0, t));
    fragColor = vec4(col, 1.0);
    return;
  }

  // Layer D: Heat-scorched yellowing paper (52px .. 100px)
  if (diff < 100.0) {
    float t = (diff - 52.0) / 48.0;
    vec3 heatBrown = vec3(0.65, 0.52, 0.36);
    vec3 col = mix(heatBrown, paperCol, smoothstep(0.0, 1.0, t));
    fragColor = vec4(col, 1.0);
    return;
  }

  // 3. Unburnt paper sheet
  fragColor = vec4(paperCol, 1.0);
}
`;

export function ThemeGate({ onSelect }: ThemeGateProps) {
  const { isGateOpen, closeGate, isLoaderDone, setTheme, systemHint } = useTheme();

  const [focusedIndex, setFocusedIndex] = useState<number>(() =>
    systemHint === "light" ? 1 : 0
  );
  const [isBurning, setIsBurning] = useState(false);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);

  const darkBtnRef = useRef<HTMLButtonElement>(null);
  const lightBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and pause Lenis while gate is open
  useEffect(() => {
    if (!isGateOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const lenis = getLenis();
    if (lenis) {
      lenis.stop();
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (lenis) {
        lenis.start();
      }
    };
  }, [isGateOpen]);

  // Focus the pre-highlighted option when gate mounts
  useEffect(() => {
    if (!isGateOpen || isBurning) return;
    const timer = setTimeout(() => {
      if (systemHint === "light") {
        lightBtnRef.current?.focus();
        setFocusedIndex(1);
      } else {
        darkBtnRef.current?.focus();
        setFocusedIndex(0);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isGateOpen, isBurning, systemHint]);

  /* ── Burning Paper Animation Engine ── */
  const runBurnAnimation = useCallback(
    (originX: number, originY: number, chosenTheme: Theme) => {
      const canvas = canvasRef.current;
      const contentEl = contentRef.current;

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Immediately switch the theme underneath so the revealed site is already styled
      setTheme(chosenTheme);
      onSelect?.(chosenTheme);

      if (reducedMotion || !canvas) {
        // Fallback: simple 300ms cross-fade for reduced motion or missing canvas
        if (contentEl) {
          contentEl.style.transition = "opacity 300ms ease-out";
          contentEl.style.opacity = "0";
        }
        setTimeout(() => {
          closeGate();
          document.getElementById("main-content")?.focus();
        }, 300);
        return;
      }

      // Initialize WebGL2
      const gl = canvas.getContext("webgl2", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
      });

      if (!gl) {
        // Fallback to fast fade if WebGL2 unavailable
        if (contentEl) {
          contentEl.style.transition = "opacity 300ms ease-out";
          contentEl.style.opacity = "0";
        }
        setTimeout(() => {
          closeGate();
          document.getElementById("main-content")?.focus();
        }, 300);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.display = "block";

      gl.viewport(0, 0, canvas.width, canvas.height);

      // Compile Shader Program
      const createShader = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) return null;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };

      const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
      const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      gl.useProgram(program);

      // Fullscreen quad
      const quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const posLoc = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const uResLoc = gl.getUniformLocation(program, "uResolution");
      const uOriginLoc = gl.getUniformLocation(program, "uOrigin");
      const uProgressLoc = gl.getUniformLocation(program, "uProgress");
      const uTimeLoc = gl.getUniformLocation(program, "uTime");

      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform2f(uOriginLoc, originX * dpr, (height - originY) * dpr);

      // Initialize Particles (embers & ash flakes)
      const particles: Particle[] = [];
      const particleCount = 100;
      for (let i = 0; i < particleCount; i++) {
        const isAsh = Math.random() > 0.65;
        particles.push({
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 2.2 - 0.8,
          size: isAsh ? Math.random() * 4 + 2 : Math.random() * 3 + 1.5,
          life: Math.random() * 0.8,
          maxLife: Math.random() * 0.9 + 0.5,
          color: isAsh
            ? [0.25, 0.20, 0.16]
            : [1.0, Math.random() * 0.4 + 0.45, 0.08],
          isAsh,
        });
      }

      // 2D Overlay canvas for high-perf crisp particles
      let particleCanvas: HTMLCanvasElement | null = document.createElement("canvas");
      particleCanvas.width = canvas.width;
      particleCanvas.height = canvas.height;
      particleCanvas.style.position = "fixed";
      particleCanvas.style.inset = "0";
      particleCanvas.style.width = "100%";
      particleCanvas.style.height = "100%";
      particleCanvas.style.pointerEvents = "none";
      particleCanvas.style.zIndex = "100001";
      document.body.appendChild(particleCanvas);
      const pCtx = particleCanvas.getContext("2d");

      const startTime = performance.now();
      const burnDurationMs = 2100; // 2.1s organic burn duration

      let animId = 0;

      const render = (now: number) => {
        const elapsed = now - startTime;
        const linearProgress = Math.min(1.0, elapsed / burnDurationMs);
        
        // Smooth ease-in-out curve
        const progress =
          linearProgress < 0.5
            ? 4 * linearProgress * linearProgress * linearProgress
            : 1 - Math.pow(-2 * linearProgress + 2, 3) / 2;

        const maxDist = Math.hypot(
          Math.max(originX, width - originX),
          Math.max(originY, height - originY)
        );
        const currentRadius = progress * (maxDist + 160);

        // Update DOM content mask so cards & text burn away with the paper
        if (contentEl) {
          const maskPx = Math.max(0, currentRadius - 20);
          contentEl.style.webkitMaskImage = `radial-gradient(circle at ${originX}px ${originY}px, transparent ${maskPx}px, black ${maskPx + 60}px)`;
          contentEl.style.maskImage = `radial-gradient(circle at ${originX}px ${originY}px, transparent ${maskPx}px, black ${maskPx + 60}px)`;
        }

        // Draw WebGL Paper Burn
        gl.useProgram(program);
        gl.uniform1f(uProgressLoc, progress);
        gl.uniform1f(uTimeLoc, (now - startTime) * 0.001);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Update & Render Particles
        if (pCtx && particleCanvas) {
          pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
          pCtx.save();
          pCtx.scale(dpr, dpr);

          const timeSec = (now - startTime) * 0.001;

          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.life += 0.016;

            if (p.life >= p.maxLife && progress < 0.95) {
              // Re-spawn along current burn perimeter
              const angle = Math.random() * Math.PI * 2;
              const r = currentRadius * (0.92 + Math.random() * 0.12);
              p.x = originX + Math.cos(angle) * r;
              p.y = originY + Math.sin(angle) * r;
              p.vx = (Math.random() - 0.5) * 2.0;
              p.vy = -Math.random() * 3.0 - 1.0;
              p.life = 0;
            }

            // Physics drift
            p.x += p.vx + Math.sin(timeSec * 4.0 + i) * 0.5;
            p.y += p.vy;

            const alpha = Math.max(0, 1 - p.life / p.maxLife);
            if (alpha > 0) {
              pCtx.beginPath();
              pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              if (p.isAsh) {
                pCtx.fillStyle = `rgba(50, 40, 30, ${alpha * 0.7})`;
              } else {
                pCtx.fillStyle = `rgba(255, ${Math.floor(p.color[1] * 255)}, 20, ${alpha * 0.9})`;
                pCtx.shadowBlur = 8;
                pCtx.shadowColor = "rgba(255, 140, 20, 0.8)";
              }
              pCtx.fill();
            }
          }
          pCtx.restore();
        }

        if (linearProgress < 1.0) {
          animId = requestAnimationFrame(render);
        } else {
          // Burn Complete: Cleanup & Unmount
          cancelAnimationFrame(animId);

          if (particleCanvas && particleCanvas.parentNode) {
            particleCanvas.parentNode.removeChild(particleCanvas);
            particleCanvas = null;
          }

          gl.deleteBuffer(quadBuffer);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
          gl.deleteProgram(program);

          closeGate();
          document.getElementById("main-content")?.focus();
        }
      };

      animId = requestAnimationFrame(render);
    },
    [closeGate, onSelect, setTheme]
  );

  const handleChoose = useCallback(
    (chosen: Theme, origin?: { x: number; y: number } | React.MouseEvent) => {
      if (isBurning) return;
      setIsBurning(true);
      setActiveTheme(chosen);

      let originX = window.innerWidth / 2;
      let originY = window.innerHeight / 2;

      if (origin) {
        if ("clientX" in origin && "clientY" in origin) {
          originX = origin.clientX;
          originY = origin.clientY;
        } else if ("x" in origin && "y" in origin) {
          originX = origin.x;
          originY = origin.y;
        }
      }

      runBurnAnimation(originX, originY, chosen);
    },
    [isBurning, runBurnAnimation]
  );

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isGateOpen || isBurning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Direct shortcuts: 'D' for Dark, 'L' for Light
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        const rect = darkBtnRef.current?.getBoundingClientRect();
        handleChoose(
          "dark",
          rect
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : undefined
        );
        return;
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        const rect = lightBtnRef.current?.getBoundingClientRect();
        handleChoose(
          "light",
          rect
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : undefined
        );
        return;
      }

      // Arrow navigation
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex(1);
        lightBtnRef.current?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex(0);
        darkBtnRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleChoose, isBurning, isGateOpen]);

  // Don't render until the preloader has signaled completion
  if (!isLoaderDone || !isGateOpen) {
    return null;
  }

  return (
    <div
      ref={dialogRef}
      className={`theme-gate ${isBurning ? "theme-gate--burning" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-gate-title"
      aria-describedby="theme-gate-desc"
    >
      {/* WebGL2 Burning-Paper Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="theme-gate__canvas"
        aria-hidden="true"
      />

      {/* SVG Displacement Filter for organic DOM tearing */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="paper-burn-displace">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="35"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Gate Paper Content Layer */}
      <div ref={contentRef} className="theme-gate__content">
        <header className="theme-gate__header">
          <div className="theme-gate__eyebrow mono">00 / SETUP</div>
          <h1 id="theme-gate-title" className="theme-gate__title">
            Choose your <em>vibe</em>
          </h1>
          <p id="theme-gate-desc" className="theme-gate__subtitle">
            Select an aesthetic to illuminate the workspace.
          </p>
        </header>

        {/* The Two Choice Cards */}
        <div className="theme-gate__options" role="radiogroup" aria-label="Theme selection">
          {/* DARK THEME OPTION */}
          <button
            ref={darkBtnRef}
            type="button"
            role="radio"
            aria-checked={focusedIndex === 0}
            className={`theme-gate__card theme-gate__card--dark ${
              activeTheme === "dark" ? "theme-gate__card--active" : ""
            }`}
            onClick={(e) => handleChoose("dark", e)}
            onFocus={() => setFocusedIndex(0)}
          >
            <div className="theme-gate__card-inner" data-theme="dark">
              <div className="theme-gate__card-header">
                <div className="theme-gate__card-badge mono">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  <span>DARK THEME</span>
                </div>
                {systemHint === "dark" && (
                  <span className="theme-gate__hint-pill mono">SYSTEM MATCH</span>
                )}
              </div>

              {/* Miniature live preview in DARK */}
              <div className="theme-gate__preview">
                <div className="theme-gate__preview-header">
                  <span className="theme-gate__preview-eyebrow mono">02 / IN PROGRESS</span>
                  <div className="theme-gate__preview-title">
                    Currently <em>building</em>
                  </div>
                </div>

                <div className="theme-gate__preview-card">
                  <div className="theme-gate__preview-row">
                    <span className="theme-gate__preview-dot" />
                    <span className="theme-gate__preview-node mono">node_00 · ACTIVE</span>
                  </div>
                  <div className="theme-gate__preview-pipe mono">
                    [RESEARCH] <span className="arrow">→</span> [DEPLOY]
                  </div>
                  <div className="theme-gate__preview-pills">
                    <span className="theme-gate__preview-pill">Python</span>
                    <span className="theme-gate__preview-pill">PyTorch</span>
                  </div>
                </div>

                <div className="theme-gate__preview-term">
                  <div className="theme-gate__preview-term-dots">
                    <span className="dot dot--red" />
                    <span className="dot dot--yellow" />
                    <span className="dot dot--green" />
                  </div>
                  <span className="theme-gate__preview-term-line mono">
                    <span className="arrow">➡︎</span> node developer.js
                  </span>
                </div>
              </div>

              <div className="theme-gate__card-footer">
                <span className="theme-gate__card-cta">
                  <span>Enter Dark Mode</span>
                  <span className="theme-gate__card-key mono">[D]</span>
                </span>
                <span className="theme-gate__card-subtext">Warm obsidian · Antique gold</span>
              </div>
            </div>
          </button>

          {/* LIGHT THEME OPTION */}
          <button
            ref={lightBtnRef}
            type="button"
            role="radio"
            aria-checked={focusedIndex === 1}
            className={`theme-gate__card theme-gate__card--light ${
              activeTheme === "light" ? "theme-gate__card--active" : ""
            }`}
            onClick={(e) => handleChoose("light", e)}
            onFocus={() => setFocusedIndex(1)}
          >
            <div className="theme-gate__card-inner" data-theme="light">
              <div className="theme-gate__card-header">
                <div className="theme-gate__card-badge mono">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                  <span>LIGHT THEME</span>
                </div>
                {systemHint === "light" && (
                  <span className="theme-gate__hint-pill mono">SYSTEM MATCH</span>
                )}
              </div>

              {/* Miniature live preview in LIGHT */}
              <div className="theme-gate__preview">
                <div className="theme-gate__preview-header">
                  <span className="theme-gate__preview-eyebrow mono">02 / IN PROGRESS</span>
                  <div className="theme-gate__preview-title">
                    Currently <em>building</em>
                  </div>
                </div>

                <div className="theme-gate__preview-card">
                  <div className="theme-gate__preview-row">
                    <span className="theme-gate__preview-dot" />
                    <span className="theme-gate__preview-node mono">node_00 · ACTIVE</span>
                  </div>
                  <div className="theme-gate__preview-pipe mono">
                    [RESEARCH] <span className="arrow">→</span> [DEPLOY]
                  </div>
                  <div className="theme-gate__preview-pills">
                    <span className="theme-gate__preview-pill">Python</span>
                    <span className="theme-gate__preview-pill">PyTorch</span>
                  </div>
                </div>

                <div className="theme-gate__preview-term">
                  <div className="theme-gate__preview-term-dots">
                    <span className="dot dot--red" />
                    <span className="dot dot--yellow" />
                    <span className="dot dot--green" />
                  </div>
                  <span className="theme-gate__preview-term-line mono">
                    <span className="arrow">➡︎</span> node developer.js
                  </span>
                </div>
              </div>

              <div className="theme-gate__card-footer">
                <span className="theme-gate__card-cta">
                  <span>Enter Light Mode</span>
                  <span className="theme-gate__card-key mono">[L]</span>
                </span>
                <span className="theme-gate__card-subtext">Warm sepia paper · Golden amber</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
