export interface RepoActivity {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  commits: number;
  pullRequests: number;
  contributors: string[];
}

export interface SecurityTopic {
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  relatedRepos: string[];
}

export interface Feature {
  title: string;
  description: string;
  category: string;
  relatedRepos: string[];
}

export interface AuthorActivity {
  login: string;
  avatarUrl: string;
  commits: number;
  repos: string[];
}

export interface CommitInfo {
  message: string;
  sha: string;
}

export interface OrgReport {
  orgName: string;
  orgAvatarUrl: string;
  year: number;
  generatedAt: string;
  excludedRepos: string[];
  repos: RepoActivity[];
  securityTopics: SecurityTopic[];
  features: Feature[];
  authors: AuthorActivity[];
  commitMessages?: Record<string, CommitInfo[]>;
}
