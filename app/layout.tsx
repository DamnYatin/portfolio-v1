import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { preload } from "react-dom";
import { Plus_Jakarta_Sans, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import SmoothScroll from "../components/SmoothScroll";
import CursorReticle from "../components/CursorReticle";
import MemProbe from "../components/MemProbe";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { themeInitScript } from "../lib/theme-script";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { ThemeGate } from "../components/theme/ThemeGate";
import "../styles/tokens.css";
import "../styles/theme-ui.css";
import "./globals.css";
import "./evolution.css";

// Absolute-URL base for canonical links, OG/Twitter images, and the sitemap.
// Env var wins on Vercel previews; falls back to the production domain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yatinmishra.dev";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  // 300 was loaded but never referenced anywhere in globals.css or TSX
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: "Yatin Mishra: Rust & Open-Source Developer",
  description:
    "Second-year CS student at Ramdeobaba University, Nagpur. I build fast developer tools in Rust, maintain open-source security tooling, and contribute to open source through GirlScript Summer of Code.",
  keywords: [
    "Yatin Mishra",
    "Rust Developer",
    "Open Source Developer",
    "GirlScript Summer of Code",
    "Tokio",
    "Termux Tools",
    "Ramdeobaba University",
    "Systems Programming",
    "CLI Tools",
    "C++",
    "Linux",
  ],
  openGraph: {
    title: "Yatin Mishra: Rust & Open-Source Developer",
    description:
      "Second-year CS student at Ramdeobaba University, Nagpur. I build fast developer tools in Rust, maintain open-source security tooling, and contribute to open source through GirlScript Summer of Code.",
    type: "website",
    url: "/",
    siteName: "Yatin Mishra",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yatin Mishra: Rust & Open-Source Developer",
    description:
      "Second-year CS student at Ramdeobaba University, Nagpur. I build fast developer tools in Rust, maintain open-source security tooling, and contribute to open source through GirlScript Summer of Code.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0B09",
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Kick off hero-critical asset fetches from the initial HTML instead of
  // waiting for client JS to evaluate useGLTF.preload — parallel with the
  // JS download, shortens the preloader's wall time on cold loads.
  preload("/assets/hardware_laptop.glb", { as: "fetch", crossOrigin: "anonymous" });
  // crossOrigin must match THREE's loaders (anonymous) or the preloaded
  // response has a different credentials mode and both textures download twice.
  preload("/assets/textures/bg.jpg", { as: "image", crossOrigin: "anonymous" });
  preload("/assets/textures/Mac Keyboard.jpg", {
    as: "image",
    crossOrigin: "anonymous",
  });

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="dark"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ThemeGate />
          <Script id="scroll-restoration" strategy="beforeInteractive">
            {`history.scrollRestoration = "manual";
if (!location.hash) window.scrollTo(0, 0);`}
          </Script>
          {/* Film-grain noise overlay — fixed, pointer-events-none, adds physical texture */}
          <div className="grain-overlay" aria-hidden="true" />
          {/* Person structured data for name-search rich results */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Yatin Mishra",
                url: SITE_URL,
                jobTitle: "Rust & Open-Source Developer",
                alumniOf: {
                  "@type": "CollegeOrUniversity",
                  name: "Ramdeobaba University, Nagpur",
                },
                sameAs: [
                  "https://github.com/DamnYatin",
                  "https://www.linkedin.com/in/yatinmishra1",
                ],
              }),
            }}
          />
          <SmoothScroll>{children}</SmoothScroll>
          {/* Detection-reticle cursor — body-level sibling so position:fixed is
              never trapped inside a transformed ancestor. Renders null on
              touch / reduced-motion. */}
          <CursorReticle />
          {/* Temporary OOM-investigation HUD — renders nothing without ?memprobe */}
          <MemProbe />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
