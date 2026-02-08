create a new static react+tailwind single page application : "GitHub yearly organisation review"

the app will present a github organisation yearly activity

- Most commented PRs (animated carousel with gitmoji support)
- Most active repos (ranked by commits, PRs, contributors)
- Top security topics (LLM-inferred from commits, grouped by OWASP Top 10 2025 categories)
- Top features (LLM-inferred from commits, grouped by thematic categories)
- Most active authors (leaderboard with avatars, commit counts, repo contributions)
- Drill-down pages for each feature and security topic

Notes:

- Use GitHub API (Octokit) for data collection
- Use openai compatible endpoints for LLM commit analysis
- Add an option to exclude some repos
- Filter out bot/dependency update commits (dependabot, renovate) from LLM analysis
- Support incremental data generation (reuse existing report.json to skip API calls)
- Handle GitHub API rate limits automatically
- Chunk large commit sets for LLM inference and merge/deduplicate results

Scripts:

- generate-data.ts // generate all the data for the static app

GitHub workflows:

- generate-data.yml // run the script weekly (Monday 6am UTC) or manually, use current org as default
- deploy-github-pages.yml // build and publish the app on github-pages on every push to main
