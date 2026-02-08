<p align="center">
  <img src="https://github.githubassets.com/images/mona-whisper.gif" width="80" />
</p>

<h1 align="center">GitHub Org Year in Review</h1>

<p align="center">
  <strong>Generate a beautiful, static dashboard summarizing your GitHub organization's yearly activity.</strong>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-features">Features</a> &bull;
  <a href="#%EF%B8%8F-configuration">Configuration</a> &bull;
  <a href="#-how-it-works">How It Works</a> &bull;
  <a href="#-deploy">Deploy</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-7-purple?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Deploy-GitHub_Pages-black?logo=github" alt="GitHub Pages" />
</p>

---

## Use This Template

> **This repository is a GitHub Template.** Click the green **"Use this template"** button above to create your own copy, then follow the setup below. Your org's yearly report will be live in minutes.

Example deployment : https://revolunet.github.io/github-org-year

## Features

|                         | Feature                                                          | Description |
| ----------------------- | ---------------------------------------------------------------- | ----------- |
| **Most Active Repos**   | Ranked by commits, PRs, and contributors for the year            |
| **Top Features**        | AI-inferred themes and major work areas from commit messages     |
| **Security Topics**     | AI-detected security fixes, hardening, and vulnerability patches |
| **Most Active Authors** | Leaderboard with avatars, commit counts, and repo contributions  |
| **Exclude Repos**       | Filter out irrelevant or internal repos from the report          |
| **Drill-Down Pages**    | Click into any feature or security topic for details             |
| **Fully Static**        | No backend needed &mdash; just a JSON file and a static site     |
| **Auto-Refresh**        | Weekly GitHub Actions workflow keeps data up to date             |

---

## Quick Start

### 1. Create your repo from this template

Click **"Use this template"** on GitHub, or:

```bash
gh repo create my-org/year-in-review --template <this-repo> --public
```

### 2. Add repository secrets

Go to **Settings > Secrets and variables > Actions** and add:

| Secret            | Required | Description                                                                 |
| ----------------- | -------- | --------------------------------------------------------------------------- |
| `GH_PAT`          | **Yes**  | GitHub Personal Access Token with `read:org` and `repo` scope               |
| `OPENAI_API_KEY`  | No       | Enables AI-powered feature & security topic inference                       |
| `OPENAI_BASE_URL` | No       | Custom OpenAI-compatible endpoint (defaults to `https://api.openai.com/v1`) |
| `OPENAI_MODEL`    | No       | Model to use (defaults to `gpt-4o-mini`)                                    |

### 3. Run the data generation workflow

Go to **Actions > Generate Data > Run workflow**. Optionally set:

- **Year** &mdash; defaults to current year
- **Excluded repos** &mdash; comma-separated list (e.g. `docs,legacy-app`)

### 4. Enable GitHub Pages

Go to **Settings > Pages** and set **Source** to **GitHub Actions**. The deploy workflow triggers automatically on every push to `main`.

That's it. Your yearly report is live at `https://<org>.github.io/<repo-name>/`

---

## Local Development

```bash
# Install dependencies
npm install

# Generate data locally
export GITHUB_TOKEN="ghp_..."
export GITHUB_ORG="my-org"
export OPENAI_API_KEY="sk-..."       # optional, for AI features
npm run generate-data

# Start dev server
npm run dev
```

The app loads `public/data/report.json`. A sample file (`report.sample.json`) is included so you can run the UI without generating real data:

```bash
cp public/data/report.sample.json public/data/report.json
npm run dev
```

---

## Configuration

### Environment Variables (for `generate-data`)

| Variable          | Default                     | Description                                        |
| ----------------- | --------------------------- | -------------------------------------------------- |
| `GITHUB_TOKEN`    | &mdash;                     | **Required.** GitHub PAT with org/repo read access |
| `GITHUB_ORG`      | &mdash;                     | **Required.** GitHub organization name             |
| `YEAR`            | Current year                | Year to generate the report for                    |
| `EXCLUDED_REPOS`  | &mdash;                     | Comma-separated repo names to skip                 |
| `OPENAI_API_KEY`  | &mdash;                     | Enables LLM-based feature & security inference     |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Any OpenAI-compatible API endpoint                 |
| `OPENAI_MODEL`    | `gpt-4o-mini`               | Model used for commit analysis                     |

### GitHub Actions Workflows

| Workflow                   | Trigger                       | What it does                                               |
| -------------------------- | ----------------------------- | ---------------------------------------------------------- |
| **Generate Data**          | Manual / Weekly (Mon 6am UTC) | Fetches org data, runs LLM analysis, commits `report.json` |
| **Deploy to GitHub Pages** | Push to `main`                | Builds the React app and deploys to GitHub Pages           |

---

## How It Works

```
                  ┌─────────────────┐
                  │  GitHub Actions  │
                  │  (weekly cron)   │
                  └────────┬────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   generate-data.ts     │
              │                        │
              │  1. Fetch all org repos│
              │  2. Count commits, PRs │
              │  3. Map contributors   │
              │  4. Collect messages    │
              │  5. LLM inference      │
              │     ├─ Security topics │
              │     └─ Top features    │
              │  6. Write report.json  │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │    public/data/        │
              │    report.json         │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  React + Tailwind SPA  │
              │  (deployed on GH Pages)│
              │                        │
              │  ├─ Dashboard overview  │
              │  ├─ Repo leaderboard   │
              │  ├─ Author stats       │
              │  ├─ Feature drill-down │
              │  └─ Security details   │
              └────────────────────────┘
```

**No backend required.** The data generation script runs in CI, produces a static JSON file, and the React app reads it at runtime.

---

## Tech Stack

- **[React 19](https://react.dev/)** + **[React Router 7](https://reactrouter.com/)** &mdash; UI and navigation
- **[Tailwind CSS 3](https://tailwindcss.com/)** &mdash; Styling
- **[Vite 7](https://vite.dev/)** &mdash; Build tooling
- **[Octokit](https://github.com/octokit/rest.js)** &mdash; GitHub API client
- **[OpenAI SDK](https://github.com/openai/openai-node)** &mdash; LLM inference (any compatible endpoint)
- **[GitHub Pages](https://pages.github.com/)** &mdash; Hosting

---

## Using with Alternative LLM Providers

The `OPENAI_BASE_URL` variable lets you point to any OpenAI-compatible API. Examples:

```bash
# Ollama (local)
OPENAI_BASE_URL=http://localhost:11434/v1

# Azure OpenAI
OPENAI_BASE_URL=https://my-resource.openai.azure.com/openai/deployments/my-deployment

# Anthropic via proxy, Mistral, etc.
OPENAI_BASE_URL=https://my-proxy.example.com/v1
```

---

## Project Structure

```
.
├── .github/workflows/
│   ├── generate-data.yml       # Data generation (weekly + manual)
│   └── deploy-github-pages.yml # Build & deploy static site
├── scripts/
│   └── generate-data.ts        # Fetches GitHub data + LLM analysis
├── public/data/
│   ├── report.json             # Generated report (gitignored)
│   └── report.sample.json      # Sample data for local dev
├── src/
│   ├── components/             # React components
│   ├── pages/                  # Route pages
│   ├── hooks/                  # Data fetching hooks
│   └── types.ts                # TypeScript interfaces
└── package.json
```

---

## License

MIT

---

<p align="center">
  Built with GitHub API + LLMs + React<br/>
  <sub>Star this repo if you find it useful!</sub>
</p>
