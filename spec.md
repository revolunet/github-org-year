create a new static react+tailwind single page application application : "GitHub yearly organisation review"

the app will present a github organisation yearly activity

- Most active repos
- Top security topics (use LLM to infer from the commits)
- Top features (use LLM to infer from the commits)
- Most active authors

Notes:

- Use GitHub API if needed
- Use openai compatible endpoints if you need LLMs calls
- Add an option to exlude some repos

Scripts:

- generate-data.ts // generate all the data for the static app

GitHub workflows:

- generate-data.yml // run the script, use current org as default
- deploy-github-pages.yml // buid and publish the app on github-pages
