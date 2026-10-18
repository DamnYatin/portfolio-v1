/**
 * Centralized content source of truth for Yatin Mishra's developer portfolio.
 * All resume copy, links, projects, and section details are defined here.
 */

export const PERSONAL_INFO = {
  name: "Yatin Mishra",
  firstName: "Yatin",
  lastName: "Mishra",
  firstNameChars: ["Y", "a", "t", "i", "n"],
  lastNameChars: ["M", "i", "s", "h", "r", "a"],
  role: "Rust & Open-Source Developer",
  email: "yatinmishra911@gmail.com",
  location: "Nagpur, India",
  timezone: "Asia/Kolkata",
  timezoneLabel: "GMT+5:30",
  status: "open to internships & open-source collaboration · Class of 2029",
  resumePath: "/Yatin_Mishra_Resume.pdf",
  social: {
    github: "https://github.com/DamnYatin",
    linkedin: "https://www.linkedin.com/in/yatinmishra1",
    codechef: "https://codechef.com/yatinmishra",
    leetcode: "https://leetcode.com/yatinmishra1",
    codeforces: "https://codeforces.com/profile/yatinmishra",
  },
  education: {
    institution: "Ramdeobaba University",
    location: "Nagpur, India",
    degree: "B.Tech in Computer Science and Engineering",
    period: "Aug 2025 – Aug 2029",
    classOf: "Class of 2029",
    coursework: [
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "Linear Algebra",
      "Operating Systems",
    ],
  },
  experience: {
    role: "Open Source Contributor",
    organization: "GirlScript Summer of Code",
    period: "Aug 2026 – Present",
    highlights: [
      "Contributed to open-source repositories by developing key features, resolving critical bugs and improving maintainability.",
      "Engineered modular, high-performance code following clean-architecture standards; collaborated with maintainers through peer code reviews.",
    ],
  },
} as const;

export const SITE_METADATA = {
  title: "Yatin Mishra: Rust & Open-Source Developer",
  description:
    "Second-year CS student at Ramdeobaba University, Nagpur. I build fast developer tools in Rust, maintain open-source security tooling, and contribute to open source through GirlScript Summer of Code.",
  siteUrl: "https://yatinmishra.dev",
  ogAlt: "Yatin Mishra — Rust & Open-Source Developer",
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
} as const;

export const HERO_CONTENT = {
  chips: {
    gold1: "high-performance Rust tools",
    gold2: "open-source security tooling",
    blue: "clean, modular code",
    serif: "from first commit to community.",
  },
  sub: {
    lead: "Second-year CS at Ramdeobaba University, Nagpur, Class of 2029. Open-source contributor with GirlScript Summer of Code 2026, open to ",
    highlight: "internships",
    tail: " and collaboration.",
  },
  ctas: {
    work: "Explore featured work",
    linkedin: "Connect on LinkedIn",
    resume: "View resume ↗",
  },
} as const;

export const FEATURED_PROJECTS = [
  {
    id: "mini-redis",
    title: "Mini-Redis",
    subtitle: "Async Redis CLI in Rust",
    metric: "Rust · Tokio · async I/O",
    description:
      "A Redis command-line interface built from scratch in Rust on the Tokio runtime. Asynchronous, non-blocking I/O keeps it fast, and a clean command interface gives developers a reliable way to query and manipulate data without leaving the terminal.",
    proofPoints: [
      "Engineered from scratch in Rust with the Tokio async runtime",
      "Designed for fast, reliable data querying and manipulation",
      "Focused on a robust, developer-friendly CLI experience",
    ],
    tech: "Rust, Tokio, Async I/O, CLI",
    tags: ["Rust", "Tokio", "CLI", "Async"],
    // TODO(yatin): replace with exact repo URL once public
    github: "https://github.com/DamnYatin",
    links: [
      // TODO(yatin): replace with exact repo URL once public
      { label: "View Source", href: "https://github.com/DamnYatin" },
    ],
    visualType: "terminal-session",
  },
  {
    id: "termux-tools",
    title: "Collection of Termux Tools",
    subtitle: "Open-source security tool directory",
    metric: "400+ tools · 320+ stars · 30+ forks",
    description:
      "A curated, community-driven directory of penetration-testing and OSINT tools for Termux. I organized industry-standard security frameworks into 10+ domains, from Web App Testing to Network Enumeration, so mobile security researchers can find the right tool quickly.",
    proofPoints: [
      "Curated and maintained 400+ pentesting and OSINT tools",
      "Earned 320+ stars and 30+ forks from the developer community",
      "Categorized tools across 10+ domains to streamline mobile security research",
    ],
    tech: "Termux, Pentesting, OSINT, Bash, Python, Git",
    tags: ["Termux", "Pentesting", "OSINT", "Open Source"],
    // TODO(yatin): replace with exact repo URL once public
    github: "https://github.com/DamnYatin",
    links: [
      // TODO(yatin): replace with exact repo URL once public
      { label: "View Source", href: "https://github.com/DamnYatin" },
    ],
    visualType: "stat-card",
  },
  {
    id: "gssoc",
    title: "GirlScript Summer of Code",
    subtitle: "Open-source contributions · Aug 2026 – Present",
    metric: "Features · Bug fixes · Code reviews",
    description:
      "Contributing to open-source repositories as part of GirlScript Summer of Code: building features, resolving critical bugs, and improving maintainability while collaborating with maintainers through peer code reviews.",
    proofPoints: [
      "Developed key features and resolved critical bugs across open-source repos",
      "Wrote modular, high-performance code following clean-architecture standards",
      "Iterated with maintainers through peer code reviews",
    ],
    tech: "Git, Open Source, Clean Architecture, Code Review, CI/CD",
    tags: ["Open Source", "Code Review", "Clean Architecture"],
    github: "https://github.com/DamnYatin",
    links: [
      { label: "View Contributions", href: "https://github.com/DamnYatin" },
    ],
    visualType: "pipeline-card",
  },
] as const;

export const EXPERIENCE_EDUCATION_ROWS = [
  {
    id: "gssoc-exp",
    title: "GirlScript Summer of Code",
    subtitle: "Open Source Contributor, Aug 2026 – Present",
    metric: "Features · Bug fixes · Peer reviews",
    description:
      "Contributed to open-source repositories by developing key features, resolving critical bugs and improving maintainability. Engineered modular, high-performance code following clean-architecture standards; collaborated with maintainers through peer code reviews.",
    tech: "Git · Code Review · Modular Architecture",
    links: [
      { label: "GitHub Profile", href: "https://github.com/DamnYatin" },
    ],
  },
  {
    id: "ramdeobaba-edu",
    title: "Ramdeobaba University",
    subtitle: "B.Tech, Computer Science & Engineering, Nagpur · Aug 2025 – Aug 2029",
    metric: "Class of 2029",
    description:
      "Coursework: Data Structures, Algorithms, Object-Oriented Programming, Linear Algebra, Operating Systems.",
    tech: "C/C++ · Java · Linux · Systems",
    links: [],
  },
  {
    id: "competitive-prog",
    title: "Competitive programming",
    subtitle: "CodeChef · LeetCode · Codeforces",
    metric: "Active profiles",
    description:
      "Regularly solving algorithmic problems and data structure challenges across major competitive programming platforms.",
    tech: "Data Structures · Algorithms · C++",
    links: [
      { label: "CodeChef", href: "https://codechef.com/yatinmishra" },
      { label: "LeetCode", href: "https://leetcode.com/yatinmishra1" },
      { label: "Codeforces", href: "https://codeforces.com/profile/yatinmishra" },
    ],
  },
] as const;

export const CURRENTLY_BUILDING = [
  {
    id: "building-gssoc",
    status: "Active",
    title: "Open Source: GirlScript Summer of Code",
    description:
      "Shipping features and bug fixes in open-source repos, and working through maintainer code reviews to keep the codebase clean and maintainable.",
    tags: ["OPEN SOURCE", "CODE REVIEW", "GIT"],
    steps: ["ISSUE", "PATCH", "REVIEW", "MERGE"],
  },
  {
    id: "building-termux",
    status: "Active",
    title: "Termux Tools Directory",
    description:
      "Maintaining and growing a directory of 400+ pentesting and OSINT tools, organized across 10+ security domains.",
    tags: ["OSINT", "PENTESTING", "TERMUX"],
    steps: ["CURATE", "CATEGORIZE", "REVIEW", "PUBLISH"],
  },
] as const;

export const SKILL_PILLS = [
  "C/C++",
  "JavaScript",
  "HTML/CSS",
  "Rust",
  "Java",
  "Tokio",
  "Figma",
  "Notion",
  "Jira",
  "Trello",
  "Miro",
  "Google Analytics",
  "GitHub",
  "DaVinci Resolve",
  "OBS",
  "Windows 10",
  "Arch Linux (Niri DMS)",
  "Termux",
  "Penetration Testing",
  "OSINT",
] as const;

export const ABOUT_CONTENT = {
  eyebrow: "04 / Profile",
  heading: "About",
  headingAccent: "me",
  paragraphs: [
    {
      lede: true,
      text: "I'm a second-year Computer Science student at Ramdeobaba University, Nagpur, who likes working close to the metal and close to the community. I build tools in *Rust*, like an async Redis CLI on Tokio, and I maintain an open-source directory of *400+ security tools* that has earned 320+ stars.",
    },
    {
      text: "Since August 2026 I've been contributing to open source through GirlScript Summer of Code: shipping features, fixing bugs, and learning from maintainers' code reviews. I care about *clean architecture*, modular code, and tools other developers can actually use.",
    },
    {
      small: true,
      text: "Second-year CS @ Ramdeobaba University (Class of 2029) · open to *internships & open-source collaboration*.",
    },
  ],
  terminal: {
    user: "guest@yatin: ~",
    commands: [
      { cmd: "whoami", output: "yatin-mishra" },
      { cmd: "cat stack.txt", output: "rust · c++ · js" },
      { cmd: "git log --oneline", output: "feat: ship it" },
    ],
    jsonProfile: {
      current: "B.Tech CSE, Ramdeobaba University",
      period: "2025–2029",
      location: "Nagpur, India",
      role: "Open Source Contributor (GSSoC 2026)",
      interests: ["Rust & Systems", "Open Source Tooling", "CLI Engineering"],
      status: "open to internships & collaboration",
    },
  },
} as const;

export const CONTACT_CONTENT = {
  title: "Get In Touch",
  description:
    "I'm actively looking for internships and open-source opportunities. Whether you have a question, a project idea, or just want to connect, my inbox is open.",
  email: "yatinmishra911@gmail.com",
  linkedin: "https://www.linkedin.com/in/yatinmishra1",
  github: "https://github.com/DamnYatin",
  resume: "/Yatin_Mishra_Resume.pdf",
} as const;
