import type { SecurityTopic } from "./types.ts";

export interface OwaspCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  keywords: RegExp[];
}

export const owaspCategories: OwaspCategory[] = [
  {
    id: "A01",
    title: "A01:2025 - Broken Access Control",
    icon: "\uD83D\uDEE1\uFE0F",
    color: "bg-red-100 text-red-800 border-red-200",
    keywords: [
      /broken access control/i,
      /\bIDOR\b/,
      /privilege escalation/i,
      /access control/i,
      /authorization/i,
      /\bCORS\b/,
      /role.based/i,
    ],
  },
  {
    id: "A02",
    title: "A02:2025 - Security Misconfiguration",
    icon: "\u2699\uFE0F",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    keywords: [
      /security misconfiguration/i,
      /\bCSP\b/,
      /content security policy/i,
      /\bHTSTS?\b/i,
      /\bTLS\b/,
      /\bHTTPS\b/,
      /cipher suite/i,
      /misconfigur/i,
      /container.*security/i,
      /infrastructure.*security/i,
    ],
  },
  {
    id: "A03",
    title: "A03:2025 - Software Supply Chain Failures",
    icon: "\uD83D\uDCE6",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    keywords: [
      /supply chain/i,
      /dependency vulnerabilit/i,
      /Dependency Update/i,
      /yarn security update/i,
      /npm security update/i,
      /github action/i,
      /outdated dependenc/i,
      /\bCI\/CD\b/i,
      /pipeline security/i,
      /\bSAST\b/,
      /\bDAST\b/,
      /signed commit/i,
      /\bCVE\b/i,
    ],
  },
  {
    id: "A04",
    title: "A04:2025 - Cryptographic Failures",
    icon: "\uD83D\uDD10",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    keywords: [
      /cryptograph/i,
      /secret/i,
      /credential/i,
      /\bAPI key/i,
      /sensitive data exposure/i,
      /encrypt/i,
    ],
  },
  {
    id: "A05",
    title: "A05:2025 - Injection",
    icon: "\uD83D\uDC89",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    keywords: [
      /injection/i,
      /\bXSS\b/i,
      /cross.site scripting/i,
      /\bSQL\b/i,
      /input validation/i,
      /sanitiz/i,
      /\bSSRF\b/i,
      /\bCSRF\b/i,
      /request forgery/i,
    ],
  },
  {
    id: "A06",
    title: "A06:2025 - Insecure Design",
    icon: "\uD83D\uDCD0",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    keywords: [
      /insecure design/i,
      /insecure deserializ/i,
      /threat model/i,
      /security pattern/i,
    ],
  },
  {
    id: "A07",
    title: "A07:2025 - Authentication Failures",
    icon: "\uD83D\uDD11",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    keywords: [
      /authenticat/i,
      /\bMFA\b/,
      /multi.factor/i,
      /\bOAuth/i,
      /\bJWT\b/,
      /token security/i,
      /session/i,
      /login/i,
      /\bSSO\b/,
    ],
  },
  {
    id: "A08",
    title: "A08:2025 - Software or Data Integrity Failures",
    icon: "\uD83D\uDEE0\uFE0F",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    keywords: [/integrity failure/i, /deserializ/i, /tamper/i, /code signing/i],
  },
  {
    id: "A09",
    title: "A09:2025 - Security Logging and Alerting Failures",
    icon: "\uD83D\uDCE1",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    keywords: [
      /logging/i,
      /alerting/i,
      /monitoring/i,
      /audit trail/i,
      /\bSIEM\b/,
    ],
  },
  {
    id: "A10",
    title: "A10:2025 - Mishandling of Exceptional Conditions",
    icon: "\u26A0\uFE0F",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    keywords: [
      /exception/i,
      /error handling/i,
      /fail.safe/i,
      /denial of service/i,
      /\bDoS\b/,
    ],
  },
];

export function mapTopicToOwasp(topic: SecurityTopic): OwaspCategory | null {
  const text = `${topic.title} ${topic.description}`;
  for (const category of owaspCategories) {
    if (category.keywords.some((kw) => kw.test(text))) {
      return category;
    }
  }
  return null;
}

export interface OwaspGroup {
  category: OwaspCategory;
  topics: { topic: SecurityTopic; originalIndex: number }[];
}

export function groupTopicsByOwasp(topics: SecurityTopic[]): {
  groups: OwaspGroup[];
  ungrouped: { topic: SecurityTopic; originalIndex: number }[];
} {
  const groupMap = new Map<string, OwaspGroup>();
  const ungrouped: { topic: SecurityTopic; originalIndex: number }[] = [];

  topics.forEach((topic, originalIndex) => {
    const category = mapTopicToOwasp(topic);
    if (category) {
      const existing = groupMap.get(category.id);
      if (existing) {
        existing.topics.push({ topic, originalIndex });
      } else {
        groupMap.set(category.id, {
          category,
          topics: [{ topic, originalIndex }],
        });
      }
    } else {
      ungrouped.push({ topic, originalIndex });
    }
  });

  // Sort groups by OWASP ID order
  const groups = Array.from(groupMap.values()).sort((a, b) =>
    a.category.id.localeCompare(b.category.id),
  );

  return { groups, ungrouped };
}
