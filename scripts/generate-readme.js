#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPO = 'michielhdoteth/awesome-ai-agent-tools';
const REPO_URL = `https://github.com/${REPO}`;

const CATALOGS = [
  { file: 'skills/catalog.json', key: 'skills', totalKey: 'totalSkills', name: 'Skills', desc: 'Reusable AI agent skills following the SKILL.md standard', folder: 'skills' },
  { file: 'mcps/catalog.json', key: 'servers', totalKey: 'totalServers', name: 'MCPs', desc: 'Curated Model Context Protocol servers for AI-assisted development', folder: 'mcps' },
  { file: 'loops/catalog.json', key: 'loops', totalKey: 'totalLoops', name: 'Agent Loops', desc: 'Repeatable AI-agent workflows with feedback loops', folder: 'loops' },
  { file: 'subagents/catalog.json', key: 'subagents', totalKey: 'totalSubagents', name: 'Subagents', desc: 'Specialized agent definitions with model routing', folder: 'subagents' },
  { file: 'hooks/catalog.json', key: 'hooks', totalKey: 'totalHooks', name: 'Hooks', desc: 'Production-ready Claude Code hooks for security, automation, and quality', folder: 'hooks' },
  { file: 'plugins/catalog.json', key: 'plugins', totalKey: 'totalPlugins', name: 'Plugins', desc: 'Extensions for Claude Code, OpenCode, Cursor, and 6 more platforms', folder: 'plugins' },
  { file: 'prompts/catalog.json', key: 'prompts', totalKey: 'totalPrompts', name: 'Prompts', desc: 'Curated prompt collections and marketplaces for AI coding agents', folder: 'prompts' },
  { file: 'tools/catalog.json', key: 'tools', totalKey: 'totalTools', name: 'Tools', desc: 'Essential CLI tools and utilities that enhance AI coding agent capabilities', folder: 'tools' },
];

function loadCatalog(cat) {
  const filePath = path.join(ROOT, cat.file);
  if (!fs.existsSync(filePath)) return { count: 0, categories: [] };
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const items = data[cat.key] || [];

  const actualCats = {};
  for (const item of items) {
    if (item.category) {
      actualCats[item.category] = (actualCats[item.category] || 0) + 1;
    }
  }

  return { count: items.length, categories: Object.entries(actualCats).map(([name, count]) => ({ name, count })) };
}

function generateReadme() {
  const catalogs = CATALOGS.map(c => ({ ...c, ...loadCatalog(c) }));
  const totalCount = catalogs.reduce((sum, c) => sum + c.count, 0);
  const categoryCount = catalogs.length;

  // Build TOC
  const toc = catalogs.map(c => `- [${c.name}](#${c.name.toLowerCase().replace(/\s+/g, '-')})`).join('\n');

  // Build category detail sections
  const categoryDetails = catalogs.map(c => {
    const catLines = c.categories
      .sort((a, b) => b.count - a.count)
      .map(cat => `    - ${cat.name}: ${cat.count}`)
      .join('\n');
    return `### ${c.name} (${c.count})\n\n${catLines}`;
  }).join('\n\n');

  const readme = `<div align="center">

# Awesome AI Agent Tools

> The most comprehensive open-source library of AI agent components.

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![GitHub Stars](https://img.shields.io/github/stars/${REPO}?style=flat-square&label=Stars&color=gold)](${REPO_URL}/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/${REPO}?style=flat-square&label=Forks&color=blue)](${REPO_URL}/forks)
[![Last Commit](https://img.shields.io/github/last-commit/${REPO}?style=flat-square)](${REPO_URL})
[![License](https://img.shields.io/github/license/${REPO}?style=flat-square)](${REPO_URL}/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](${REPO_URL}/pulls)

[![SKILL.md Standard](https://img.shields.io/badge/Standard-SKILL.md-blue?style=flat-square)](https://agentskills.io)
[![MCP 2026](https://img.shields.io/badge/MCP-2026-f97316?style=flat-square)](https://modelcontextprotocol.io)

[![AI Agent Skills](https://img.shields.io/badge/AI_Agent_Skills-22c55e?style=flat-square)](https://github.com/topics/ai-agent-skills)
[![Claude Code](https://img.shields.io/badge/Claude_Code-ready-7c3aed?style=flat-square)](https://github.com/topics/claude-code)
[![OpenCode](https://img.shields.io/badge/OpenCode-ready-059669?style=flat-square)](https://github.com/topics/opencode)

</div>

---

**${totalCount}** installable components across **${categoryCount}** categories. Every entry is sourced from real projects with provenance and install commands. Works with Claude Code, OpenCode, Codex, Cursor, Gemini CLI, Copilot, and 30+ AI coding assistants.

## Contents

${toc}

## Quick Stats

| Library | Count | Description | Folder |
|---------|------:|-------------|--------|
${catalogs.map(c => `| **${c.name}** | ${c.count} | ${c.desc} | [${c.folder}/](${c.folder}/) |`).join('\n')}

All data comes from \`catalog.json\` files in each folder. These catalogs are the single source of truth for programmatic discovery.

See [CONTRIBUTING.md](CONTRIBUTING.md) to add new entries, or give your AI agent the [CONTRIBUTE.md](CONTRIBUTE.md) skill and it will do it automatically.

## What Makes This Different

- **Not just links** -- every entry has install commands, star counts, and verified metadata
- **Machine-readable catalogs** -- query components programmatically via \`catalog.json\` files
- **Agent-contributable** -- your AI agent can fork, add entries, validate JSON, and submit PRs automatically
- **Cross-platform** -- works with 30+ AI coding assistants, not locked to one vendor
- **SKILL.md standard** -- skills follow the open [agentskills.io](https://agentskills.io) specification

## Category Breakdown

${categoryDetails}

## Contributing

We welcome contributions! You can:

1. **Manual PR** -- Fork, add entry to \`catalog.json\`, validate, and submit. See [CONTRIBUTING.md](CONTRIBUTING.md).
2. **Agent-automated** -- Give your AI agent the [CONTRIBUTE.md](CONTRIBUTE.md) skill and it handles everything.
3. **Open an issue** -- Suggest a tool we should add.

## Star History

<a href="https://www.star-history.com/?repos=${encodeURIComponent(REPO)}&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=${REPO}&type=date&theme=dark&legend=top-left&sealed_token=7qB_vNjnPjUftORrOm1jLU-p4K-VLE5F42aQYJd_bxsi4OYmKX1XiEaktewbBtTEvE0nnBtW_V4C_NO1fg3nzzXAEPXLdGDzRlRqc9057eVghNlZAe3Eb7-1CzT3Z5pulIZkV9hzVOTM7QyodcVeVx2JYKxCw0GfHufn-hrG54ne0_3SnURAXOnAu8PX" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=${REPO}&type=date&legend=top-left&sealed_token=7qB_vNjnPjUftORrOm1jLU-p4K-VLE5F42aQYJd_bxsi4OYmKX1XiEaktewbBtTEvE0nnBtW_V4C_NO1fg3nzzXAEPXLdGDzRlRqc9057eVghNlZAe3Eb7-1CzT3Z5pulIZkV9hzVOTM7QyodcVeVx2JYKxCw0GfHufn-hrG54ne0_3SnURAXOnAu8PX" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=${REPO}&type=date&legend=top-left&sealed_token=7qB_vNjnPjUftORrOm1jLU-p4K-VLE5F42aQYJd_bxsi4OYmKX1XiEaktewbBtTEvE0nnBtW_V4C_NO1fg3nzzXAEPXLdGDzRlRqc9057eVghNlZAe3Eb7-1CzT3Z5pulIZkV9hzVOTM7QyodcVeVx2JYKxCw0GfHufn-hrG54ne0_3SnURAXOnAu8PX" />
 </picture>
</a>
`;

  const readmePath = path.join(ROOT, 'README.md');
  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log(`README.md generated: ${totalCount} total components across ${categoryCount} categories`);
}

generateReadme();
