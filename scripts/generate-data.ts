import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import * as fs from "node:fs";
import * as path from "node:path";
import type {
  OrgReport,
  RepoActivity,
  AuthorActivity,
  SecurityTopic,
  Feature,
  CommitInfo,
} from "../src/types.ts";

// --- Config from env ---
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG;
const EXCLUDED_REPOS = (process.env.EXCLUDED_REPOS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const YEAR = parseInt(process.env.YEAR ?? String(new Date().getFullYear()), 10);
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}
if (!GITHUB_ORG) {
  console.error("GITHUB_ORG is required");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const since = `${YEAR}-01-01T00:00:00Z`;
const until = `${YEAR}-12-31T23:59:59Z`;

// --- Helpers ---

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkRateLimit() {
  const { data } = await octokit.rateLimit.get();
  const remaining = data.resources.core.remaining;
  if (remaining < 50) {
    const resetAt = data.resources.core.reset * 1000;
    const waitMs = Math.max(resetAt - Date.now(), 0) + 1000;
    console.warn(
      `Rate limit low (${remaining} remaining). Sleeping ${Math.round(waitMs / 1000)}s...`
    );
    await sleep(waitMs);
  }
}

async function getCommitCount(
  owner: string,
  repo: string
): Promise<number> {
  try {
    const res = await octokit.repos.listCommits({
      owner,
      repo,
      since,
      until,
      per_page: 1,
    });

    const linkHeader = res.headers.link;
    if (!linkHeader) {
      return res.data.length;
    }

    const match = linkHeader.match(/page=(\d+)>; rel="last"/);
    return match ? parseInt(match[1], 10) : res.data.length;
  } catch {
    return 0;
  }
}

async function getPRCount(owner: string, repo: string): Promise<number> {
  try {
    const { data } = await octokit.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:pr created:${YEAR}-01-01..${YEAR}-12-31`,
      per_page: 1,
    });
    return data.total_count;
  } catch {
    return 0;
  }
}

async function getContributors(
  owner: string,
  repo: string
): Promise<string[]> {
  try {
    const commits = await octokit.paginate(
      octokit.repos.listCommits,
      { owner, repo, since, until, per_page: 100 },
      (response) => response.data
    );

    const authors = new Set<string>();
    for (const commit of commits) {
      if (commit.author?.login) {
        authors.add(commit.author.login);
      }
    }
    return [...authors];
  } catch {
    return [];
  }
}

const BOT_COMMIT_PATTERNS = [
  /^(chore|build)\(deps(-dev)?\):/i,
  /^bump /i,
  /^update .+ to /i,
  /^upgrade .+ from .+ to /i,
  /^\[dependabot\]/i,
  /^\[renovate\]/i,
  /^renovate\//i,
];

const BOT_AUTHORS = ["dependabot[bot]", "renovate[bot]", "dependabot-preview[bot]"];

function isDependencyUpdateCommit(message: string, author?: string | null): boolean {
  if (author && BOT_AUTHORS.includes(author)) return true;
  return BOT_COMMIT_PATTERNS.some((pattern) => pattern.test(message));
}

async function getCommitMessages(
  owner: string,
  repo: string
): Promise<CommitInfo[]> {
  try {
    const commits = await octokit.paginate(
      octokit.repos.listCommits,
      { owner, repo, since, until, per_page: 100 },
      (response, done) => {
        if (response.data.length >= 100) done();
        return response.data;
      }
    );

    return commits
      .slice(0, 100)
      .filter((c) => !isDependencyUpdateCommit(
        c.commit.message.split("\n")[0],
        c.author?.login ?? c.commit.author?.name
      ))
      .map((c) => ({
        message: c.commit.message.split("\n")[0],
        sha: c.sha,
      }))
      .filter((c) => c.message);
  } catch {
    return [];
  }
}

// --- Preferred topics & categories for LLM suggestions ---

const SECURITY_TOPICS = [
  "SQL Injection",
  "Cross-Site Scripting (XSS)",
  "Cross-Site Request Forgery (CSRF)",
  "Broken Authentication",
  "Session Management",
  "Insecure Direct Object References (IDOR)",
  "Security Misconfiguration",
  "Sensitive Data Exposure",
  "Broken Access Control",
  "Server-Side Request Forgery (SSRF)",
  "Dependency Vulnerabilities",
  "Insecure Deserialization",
  "Insufficient Logging & Monitoring",
  "API Security",
  "Rate Limiting & Brute Force Protection",
  "Content Security Policy (CSP)",
  "HTTPS / TLS Configuration",
  "Secrets Management",
  "Input Validation & Sanitization",
  "File Upload Security",
  "Authentication Token Security (JWT/OAuth)",
  "Password Hashing & Storage",
  "HTTP Security Headers",
  "Container & Infrastructure Security",
  "CI/CD Pipeline Security",
];

const FEATURE_CATEGORIES = [
  "User Authentication & Login",
  "User Registration & Onboarding",
  "Role-Based Access Control",
  "User Profile Management",
  "Password Reset & Recovery",
  "Search & Filtering",
  "Pagination & Infinite Scroll",
  "Form Handling & Validation",
  "File Upload & Storage",
  "Email Notifications",
  "Push Notifications",
  "Dashboard & Analytics",
  "Admin Panel",
  "API Endpoints (REST/GraphQL)",
  "Database Migrations",
  "Caching Layer",
  "Background Jobs & Queues",
  "Logging & Error Tracking",
  "Internationalization (i18n)",
  "Dark Mode / Theming",
  "Responsive Design",
  "Accessibility (a11y)",
  "SEO Optimization",
  "Performance Optimization",
  "Rate Limiting",
  "Webhooks",
  "Third-Party Integrations",
  "Payment Processing",
  "Data Export (CSV/PDF)",
  "Data Import & Bulk Operations",
  "Real-Time Updates (WebSockets)",
  "Comments & Discussions",
  "Tagging & Categorization",
  "Version History / Audit Trail",
  "Multi-Tenancy",
  "Feature Flags",
  "A/B Testing",
  "CI/CD Pipeline",
  "Automated Testing",
  "Docker / Containerization",
  "Environment Configuration",
  "Health Checks & Monitoring",
  "Documentation & API Docs",
  "Onboarding Wizards & Tutorials",
  "Drag & Drop Interfaces",
  "Charts & Data Visualization",
  "Calendar & Scheduling",
  "Content Management (CMS)",
  "Social Login (OAuth)",
  "Two-Factor Authentication (2FA)",
];

// --- LLM ---

function parseLLMJson<T>(text: string): T {
  // Try direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }
    // Try to find array/object in text
    const bracketMatch = text.match(/[\[{][\s\S]*[\]}]/);
    if (bracketMatch) {
      return JSON.parse(bracketMatch[0]) as T;
    }
    throw new Error("Could not parse LLM response as JSON");
  }
}

const MAX_CHUNK_CHARS = 80_000; // ~20K tokens, safe for most models

function buildMessageChunks(commitMessages: Record<string, CommitInfo[]>): { text: string; repoCount: number; messageCount: number }[] {
  const chunks: { text: string; repoCount: number; messageCount: number }[] = [];
  let currentParts: string[] = [];
  let currentChars = 0;
  let currentRepoCount = 0;
  let currentMessageCount = 0;

  for (const [repo, msgs] of Object.entries(commitMessages)) {
    const part = `## ${repo}\n${msgs.map((m) => m.message).join("\n")}`;
    if (currentChars + part.length > MAX_CHUNK_CHARS && currentParts.length > 0) {
      chunks.push({ text: currentParts.join("\n\n"), repoCount: currentRepoCount, messageCount: currentMessageCount });
      currentParts = [];
      currentChars = 0;
      currentRepoCount = 0;
      currentMessageCount = 0;
    }
    currentParts.push(part);
    currentChars += part.length;
    currentRepoCount++;
    currentMessageCount += msgs.length;
  }
  if (currentParts.length > 0) {
    chunks.push({ text: currentParts.join("\n\n"), repoCount: currentRepoCount, messageCount: currentMessageCount });
  }

  const totalRepos = Object.keys(commitMessages).length;
  const totalMessages = Object.values(commitMessages).reduce((sum, msgs) => sum + msgs.length, 0);
  console.log(`  LLM: ${totalMessages} messages across ${totalRepos} repos split into ${chunks.length} chunk(s)`);
  for (let i = 0; i < chunks.length; i++) {
    console.log(`    Chunk ${i + 1}: ${chunks[i].repoCount} repos, ${chunks[i].messageCount} messages, ~${Math.round(chunks[i].text.length / 1000)}K chars`);
  }
  return chunks;
}

function mergeSecurityTopics(all: SecurityTopic[]): SecurityTopic[] {
  const map = new Map<string, SecurityTopic>();
  for (const topic of all) {
    const key = topic.title.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      const repos = new Set([...existing.relatedRepos, ...topic.relatedRepos]);
      existing.relatedRepos = [...repos];
      if (topic.severity === "high" || (topic.severity === "medium" && existing.severity === "low")) {
        existing.severity = topic.severity;
      }
    } else {
      map.set(key, { ...topic, relatedRepos: [...topic.relatedRepos] });
    }
  }
  return [...map.values()];
}

function mergeFeatures(all: Feature[]): Feature[] {
  const map = new Map<string, Feature>();
  for (const feature of all) {
    const key = feature.title.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      const repos = new Set([...existing.relatedRepos, ...feature.relatedRepos]);
      existing.relatedRepos = [...repos];
    } else {
      map.set(key, { ...feature, relatedRepos: [...feature.relatedRepos] });
    }
  }
  return [...map.values()];
}

async function inferSecurityTopics(
  commitMessages: Record<string, CommitInfo[]>,
  openai: OpenAI
): Promise<SecurityTopic[]> {
  console.log("Inferring security topics...");
  const chunks = buildMessageChunks(commitMessages);
  const allTopics: SecurityTopic[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Security topics: processing chunk ${i + 1}/${chunks.length} (${chunks[i].repoCount} repos, ${chunks[i].messageCount} messages)...`);
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a security analyst. Analyze commit messages and identify security-related topics, vulnerabilities fixed, or security improvements made. Prefer mapping findings to these well-known security topics when relevant:\n${SECURITY_TOPICS.map((t) => `- ${t}`).join("\n")}\nReturn a JSON array of objects with: title, description, severity (high/medium/low), relatedRepos (array of repo names). Return only the JSON array, no markdown.`,
        },
        {
          role: "user",
          content: `Analyze these commit messages from a GitHub organization in ${YEAR} and identify security topics:\n\n${chunks[i].text}`,
        },
      ],
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content ?? "[]";
    const parsed = parseLLMJson<SecurityTopic[]>(text);
    allTopics.push(...parsed);
    console.log(`    Found ${parsed.length} topics in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  }

  const merged = mergeSecurityTopics(allTopics);
  console.log(`  Security topics: ${allTopics.length} raw -> ${merged.length} after dedup`);
  return merged;
}

async function inferFeatures(
  commitMessages: Record<string, CommitInfo[]>,
  openai: OpenAI
): Promise<Feature[]> {
  console.log("Inferring features...");
  const chunks = buildMessageChunks(commitMessages);
  const allFeatures: Feature[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`  Features: processing chunk ${i + 1}/${chunks.length} (${chunks[i].repoCount} repos, ${chunks[i].messageCount} messages)...`);
    const start = Date.now();
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a software analyst. Analyze commit messages and identify the top features, themes, and major work areas. Prefer mapping findings to these well-known feature categories when relevant:\n${FEATURE_CATEGORIES.map((f) => `- ${f}`).join("\n")}\nReturn a JSON array of objects with: title, description, category (use one of the categories above when possible), relatedRepos (array of repo names). Return only the JSON array, no markdown.`,
        },
        {
          role: "user",
          content: `Analyze these commit messages from a GitHub organization in ${YEAR} and identify the top features and themes:\n\n${chunks[i].text}`,
        },
      ],
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content ?? "[]";
    const parsed = parseLLMJson<Feature[]>(text);
    allFeatures.push(...parsed);
    console.log(`    Found ${parsed.length} features in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  }

  const merged = mergeFeatures(allFeatures);
  console.log(`  Features: ${allFeatures.length} raw -> ${merged.length} after dedup`);
  return merged;
}

// --- Main ---

async function main() {
  console.log(`Generating report for ${GITHUB_ORG} (${YEAR})...`);
  console.log(`Excluded repos: ${EXCLUDED_REPOS.join(", ") || "none"}`);

  const outDir = path.join(import.meta.dirname, "..", "public", "data");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "report.json");

  // Check if existing report is available to skip GitHub API calls
  let existingReport: OrgReport | null = null;
  if (fs.existsSync(outPath)) {
    try {
      existingReport = JSON.parse(
        fs.readFileSync(outPath, "utf-8")
      ) as OrgReport;
      if (existingReport.year !== YEAR || existingReport.orgName !== GITHUB_ORG) {
        console.log("Existing report is for a different org/year, fetching fresh data...");
        existingReport = null;
      }
    } catch {
      console.log("Could not parse existing report, fetching fresh data...");
    }
  }

  let repoActivities: RepoActivity[];
  let authors: AuthorActivity[];
  let allCommitMessages: Record<string, CommitInfo[]>;
  let orgAvatarUrl: string;
  let orgLogin: string;

  if (existingReport) {
    console.log("Using existing repo data from report.json, skipping GitHub API calls...");
    repoActivities = existingReport.repos;
    authors = existingReport.authors;
    allCommitMessages = existingReport.commitMessages ?? {};
    orgAvatarUrl = existingReport.orgAvatarUrl;
    orgLogin = existingReport.orgName;
  } else {
    // Get org info
    const { data: orgData } = await octokit.orgs.get({ org: GITHUB_ORG });
    orgAvatarUrl = orgData.avatar_url;
    orgLogin = orgData.login;

    // Fetch all repos
    const allRepos = await octokit.paginate(octokit.repos.listForOrg, {
      org: GITHUB_ORG,
      type: "public",
      per_page: 100,
    });

    const repos = allRepos.filter(
      (r) => !r.archived && !r.private && !EXCLUDED_REPOS.includes(r.name)
    );

    console.log(
      `Found ${allRepos.length} repos, processing ${repos.length} after filtering...`
    );

    // Process repos
    repoActivities = [];
    allCommitMessages = {};
    const authorMap = new Map<
      string,
      { login: string; avatarUrl: string; commits: number; repos: Set<string> }
    >();

    for (const repo of repos) {
      await checkRateLimit();
      console.log(`  Processing ${repo.name}...`);

      try {
        const [commitCount, prCount, contributors, commitMessages] =
          await Promise.all([
            getCommitCount(GITHUB_ORG, repo.name),
            getPRCount(GITHUB_ORG, repo.name),
            getContributors(GITHUB_ORG, repo.name),
            getCommitMessages(GITHUB_ORG, repo.name),
          ]);

        if (commitCount === 0) {
          console.log(`    Skipping ${repo.name} (no commits in ${YEAR})`);
          continue;
        }

        repoActivities.push({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count ?? 0,
          commits: commitCount,
          pullRequests: prCount,
          contributors,
        });

        if (commitMessages.length > 0) {
          allCommitMessages[repo.name] = commitMessages;
        }

        // Build author stats from contributors + commits
        for (const login of contributors) {
          const existing = authorMap.get(login);
          if (existing) {
            existing.repos.add(repo.name);
          } else {
            authorMap.set(login, {
              login,
              avatarUrl: `https://github.com/${login}.png`,
              commits: 0,
              repos: new Set([repo.name]),
            });
          }
        }
      } catch (error) {
        console.warn(`  Warning: failed to process ${repo.name}:`, error);
      }
    }

    // Get per-author commit counts
    console.log("Calculating per-author commit counts...");
    for (const [repoName] of Object.entries(allCommitMessages)) {
      await checkRateLimit();
      try {
        const commits = await octokit.paginate(
          octokit.repos.listCommits,
          {
            owner: GITHUB_ORG,
            repo: repoName,
            since,
            until,
            per_page: 100,
          },
          (response) => response.data
        );

        for (const commit of commits) {
          const login = commit.author?.login;
          if (!login) continue;
          const existing = authorMap.get(login);
          if (existing) {
            existing.commits++;
          } else {
            authorMap.set(login, {
              login,
              avatarUrl: `https://github.com/${login}.png`,
              commits: 1,
              repos: new Set([repoName]),
            });
          }
        }
      } catch {
        // skip
      }
    }

    // Sort repos by commit count
    repoActivities.sort((a, b) => b.commits - a.commits);

    // Build authors list
    authors = [...authorMap.values()]
      .map((a) => ({
        login: a.login,
        avatarUrl: a.avatarUrl,
        commits: a.commits,
        repos: [...a.repos],
      }))
      .sort((a, b) => b.commits - a.commits);
  }

  // LLM inference
  let securityTopics: SecurityTopic[] = [];
  let features: Feature[] = [];

  if (OPENAI_API_KEY && Object.keys(allCommitMessages).length > 0) {
    console.log("Running LLM inference...");
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: OPENAI_BASE_URL,
    });

    try {
      [securityTopics, features] = await Promise.all([
        inferSecurityTopics(allCommitMessages, openai),
        inferFeatures(allCommitMessages, openai),
      ]);
      console.log(
        `  Found ${securityTopics.length} security topics, ${features.length} features`
      );
    } catch (error) {
      console.warn("LLM inference failed:", error);
    }
  } else {
    console.log("Skipping LLM inference (no OPENAI_API_KEY or no commits)");
  }

  // Assemble report
  const report: OrgReport = {
    orgName: orgLogin,
    orgAvatarUrl,
    year: YEAR,
    generatedAt: new Date().toISOString(),
    excludedRepos: EXCLUDED_REPOS,
    repos: repoActivities,
    securityTopics,
    features,
    authors,
    commitMessages: allCommitMessages,
  };

  // Write output
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Report written to ${outPath}`);
  console.log(
    `  ${repoActivities.length} repos, ${authors.length} authors, ${securityTopics.length} security topics, ${features.length} features`
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
