import { PROJECTS, BUILDING } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://github.com/DamnYatin";

// First sentence of a description field, used as a tight one-line gist.
function firstSentence(text: string): string {
  const match = text.match(/^.+?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

type ProjectLink = { label: string; href: string; demo?: boolean };

function buildProjectsSection(): string {
  return PROJECTS.map((project) => {
    const links: readonly ProjectLink[] = "links" in project ? project.links : [];
    const primaryHref = links.find((link) => link.label === "View Source" || link.label.startsWith("View"))?.href ?? project.github;
    const leadSentence = firstSentence(project.description);
    return `- [${project.title}](${primaryHref}): ${project.subtitle} — ${project.metric}. ${leadSentence}`;
  }).join("\n");
}

function buildBuildingSection(): string {
  return BUILDING.map(
    (item) => `- [${item.status}] ${item.title}: ${firstSentence(item.description)}`
  ).join("\n");
}

function buildBody(): string {
  return `# Yatin Mishra

> Second-year CS student at Ramdeobaba University, Nagpur (Class of 2029). I build fast developer tools in Rust, maintain open-source security tooling, and contribute to open source through GirlScript Summer of Code.

## Projects
${buildProjectsSection()}

## Currently building
${buildBuildingSection()}

## Links
- GitHub: https://github.com/DamnYatin
- LinkedIn: https://www.linkedin.com/in/yatinmishra1
- Resume: ${SITE_URL}/Yatin_Mishra_Resume.pdf
- CodeChef: https://codechef.com/yatinmishra
- LeetCode: https://leetcode.com/yatinmishra1
- Codeforces: https://codeforces.com/profile/yatinmishra
`;
}

export const dynamic = "force-static";

export function GET() {
  return new Response(buildBody(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
