#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPO = 'michielhdoteth/awesome-ai-agent-tools';
const REPO_URL = `https://github.com/${REPO}`;

const CATALOGS = [
  {
    file: 'skills/catalog.json',
    key: 'skills',
    name: 'Skills',
    title: 'Skills Catalog',
    desc: 'Reusable AI agent skills following the SKILL.md standard',
    folder: 'skills',
    plural: 'skills',
    source: (e) => (e.source && e.source.includes('/') ? `[${e.source}](https://github.com/${e.source})` : ''),
    repo: (e) => (e.source && e.source.includes('/') ? e.source : ''),
  },
  {
    file: 'mcps/catalog.json',
    key: 'servers',
    name: 'MCPs',
    title: 'MCP Server Catalog',
    desc: 'Curated Model Context Protocol servers for AI-assisted development',
    folder: 'mcps',
    plural: 'mcps',
    source: (e) => {
      if (!e.github) return '';
      const m = e.github.match(/github\.com\/([^/]+\/[^/]+)/);
      return m ? `[${m[1]}](${e.github})` : '';
    },
    repo: (e) => {
      if (!e.github) return '';
      const m = e.github.match(/github\.com\/([^/]+\/[^/]+)/);
      return m ? m[1] : '';
    },
  },
  {
    file: 'loops/catalog.json',
    key: 'loops',
    name: 'Agent Loops',
    title: 'Loop Library Catalog',
    desc: 'Repeatable AI-agent workflows with feedback loops',
    folder: 'loops',
    plural: 'loops',
    source: () => '',
    repo: () => '',
  },
  {
    file: 'subagents/catalog.json',
    key: 'subagents',
    name: 'Subagents',
    title: 'Subagents Catalog',
    desc: 'Specialized agent definitions with model routing',
    folder: 'subagents',
    plural: 'subagents',
    source: () => '',
    repo: () => '',
  },
  {
    file: 'hooks/catalog.json',
    key: 'hooks',
    name: 'Hooks',
    title: 'Hooks Catalog',
    desc: 'Production-ready Claude Code hooks for security, automation, and quality',
    folder: 'hooks',
    plural: 'hooks',
    source: () => '',
    repo: () => '',
  },
  {
    file: 'plugins/catalog.json',
    key: 'plugins',
    name: 'Plugins',
    title: 'Plugins Catalog',
    desc: 'Extensions for Claude Code, OpenCode, Cursor, and 6 more platforms',
    folder: 'plugins',
    plural: 'plugins',
    source: () => '',
    repo: () => '',
  },
  {
    file: 'prompts/catalog.json',
    key: 'prompts',
    name: 'Prompts',
    title: 'Prompts Catalog',
    desc: 'Curated prompt collections and marketplaces for AI coding agents',
    folder: 'prompts',
    plural: 'prompts',
    source: () => '',
    repo: () => '',
  },
  {
    file: 'tools/catalog.json',
    key: 'tools',
    name: 'Tools',
    title: 'Tools Catalog',
    desc: 'Essential CLI tools and utilities that enhance AI coding agent capabilities',
    folder: 'tools',
    plural: 'tools',
    source: (e) => {
      if (!e.url) return '';
      const m = e.url.match(/github\.com\/([^/]+\/[^/]+)/);
      return m ? `[${m[1]}](${e.url})` : '';
    },
    repo: (e) => {
      if (!e.url) return '';
      const m = e.url.match(/github\.com\/([^/]+\/[^/]+)/);
      return m ? m[1] : '';
    },
  },
];

function badges(repo) {
  if (!repo) return '';
  return `![Stars](https://img.shields.io/github/stars/${repo}?style=flat&label=Stars&color=gold) ![Last Commit](https://img.shields.io/github/last-commit/${repo}?style=flat)`;
}

function loadCatalog(cat) {
  const filePath = path.join(ROOT, cat.file);
  if (!fs.existsSync(filePath)) return { count: 0, categories: [], items: [] };
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const items = data[cat.key] || [];

  const actualCats = {};
  for (const item of items) {
    if (item.category) {
      actualCats[item.category] = (actualCats[item.category] || 0) + 1;
    }
  }

  const categories = Object.entries(actualCats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { count: items.length, categories, items };
}

function padCell(content, width) {
  return ` ${content.padEnd(width)} `;
}

function buildTable(items, cat) {
  const headers = ['Name', 'Category', 'Description', 'Source', 'Badges'];
  const rows = items.map((e) => [
    e.name || e.id || '',
    e.category || '',
    e.description || '',
    cat.source(e),
    badges(cat.repo(e)),
  ]);

  const widths = headers.map((h, i) => {
    let w = h.length;
    for (const r of rows) {
      if (r[i].length > w) w = r[i].length;
    }
    return w;
  });

  const lines = [];
  lines.push('|' + headers.map((h, i) => padCell(h, widths[i])).join('|') + '|');
  lines.push('|' + widths.map((w) => ` ${'-'.repeat(w)} `).join('|') + '|');
  for (const r of rows) {
    lines.push('|' + r.map((c, i) => padCell(c, widths[i])).join('|') + '|');
  }
  return lines.join('\n');
}

function generateFolderReadme(cat, data) {
  const catLines = data.categories
    .map((c) => `- **${c.name}** (${c.count})`)
    .join('\n');

  const readme = `# ${cat.title}

${cat.desc}

**${data.count}** entries across **${data.categories.length}** categories.

## Categories

${catLines}

## All ${data.count} ${cat.plural}

${buildTable(data.items, cat)}

---

Machine-readable data: [catalog.json](catalog.json)`;

  const readmePath = path.join(ROOT, cat.folder, 'README.md');
  fs.writeFileSync(readmePath, readme, 'utf8');
}

function generateLlmstxt(catalogs) {
  const totalCount = catalogs.reduce((sum, c) => sum + c.count, 0);
  const skills = catalogs.find((c) => c.folder === 'skills');
  const skillsBreakdown = skills
    ? skills.categories.map((c) => `${c.name} ${c.count}`).join(', ')
    : '';

  const mcps = catalogs.find((c) => c.folder === 'mcps');
  const loops = catalogs.find((c) => c.folder === 'loops');
  const subagents = catalogs.find((c) => c.folder === 'subagents');
  const hooks = catalogs.find((c) => c.folder === 'hooks');
  const plugins = catalogs.find((c) => c.folder === 'plugins');
  const prompts = catalogs.find((c) => c.folder === 'prompts');
  const tools = catalogs.find((c) => c.folder === 'tools');

  const today = new Date().toISOString().slice(0, 10);

  const llms = `# Awesome AI Agent Tools

> The most comprehensive open-source library for AI agent skills, MCP servers, and agent workflows. ${totalCount} installable components across 8 categories -- skills, MCPs, loops, subagents, hooks, plugins, prompts, and tools -- curated from 100+ repositories. Works with Claude Code, OpenCode, Codex, Cursor, Gemini CLI, Copilot, and 30+ AI coding assistants.

## Overview

Awesome AI Agent Tools is the largest open-source collection of installable components for AI coding assistants. Every item is sourced from real projects with provenance and install commands -- no hallucinated or synthetic entries.

The library covers the full AI agent stack: skills (SKILL.md files), MCP servers, agent workflow loops, subagent definitions, hooks, plugins, prompts, and CLI tools. Each category includes a JSON catalog for programmatic discovery and a human-readable directory. Components are tagged by platform, category, and source.

Built for interoperability, this collection works with Claude Code, OpenCode, Codex, KiloCode, Cursor, Gemini CLI, Copilot, Aider, Windsurf, and every major AI coding assistant. Contributions are welcome -- see CONTRIBUTING.md.

## What This Repo Contains

- **${skills.count} Skills**: SKILL.md files across ${skills.categories.length} categories (${skillsBreakdown})
- **${mcps.count} MCP Servers**: Model Context Protocol servers with install commands across ${mcps.categories.length} categories
- **${loops.count} Agent Loops**: Repeatable workflow patterns with prompts, verification criteria, and source attribution across ${loops.categories.length} categories
- **${subagents.count} Subagents**: Specialized agents with model routing and tool permissions across ${subagents.categories.length} categories
- **${hooks.count} Hooks**: Event-driven extensions for Claude Code across ${hooks.categories.length} categories
- **${plugins.count} Plugins**: Extensions for Claude Code, OpenCode, Cursor, Copilot, Windsurf, Aider, and JetBrains across ${plugins.categories.length} categories
- **${prompts.count} Prompts**: Curated prompt templates and strategies across ${prompts.categories.length} categories
- **${tools.count} CLI Tools**: Command-line utilities and automation across ${tools.categories.length} categories
- **JSON Catalogs**: Machine-readable catalogs for programmatic discovery

## Quick Start

\`\`\`bash
# Clone the full collection
git clone https://github.com/michielhdoteth/awesome-ai-agent-tools.git

# Browse the catalog
https://awesome-ai-agent-tools.vercel.app
\`\`\`

## Key Features

- **30+ Platforms Supported**: Claude Code, OpenCode, Codex, KiloCode, Cursor, Gemini CLI, Copilot, Aider, Windsurf, and more
- **JSON Catalogs**: Every category has a machine-readable catalog for tooling integration
- **Agent-Contributable**: Add components via CONTRIBUTE.md -- agents can self-contribute
- **SKILL.md Open Standard**: Skills follow the SKILL.md specification for portability

## Key Files

- [README](README.md) - Project overview, quick start, and full catalog
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to add skills, MCPs, or loops
- [CONTRIBUTE.md](CONTRIBUTE.md) - Agent-automatable contribution skill
- [Skills Library](skills/) - ${skills.count} SKILL.md files across ${skills.categories.length} categories
- [MCP Servers](mcps/) - ${mcps.count} MCP servers with install commands
- [Agent Loops](loops/) - ${loops.count} workflow patterns with catalog
- [Subagents](subagents/) - ${subagents.count} specialized agent definitions
- [Hooks](hooks/) - ${hooks.count} event-driven extensions
- [Plugins](plugins/) - ${plugins.count} plugins across ${plugins.categories.length} platforms
- [Prompts](prompts/) - ${prompts.count} curated prompt templates
- [CLI Tools](tools/) - ${tools.count} command-line utilities

## Related Resources

- **GitHub**: [awesome-ai-agent-tools](https://github.com/michielhdoteth/awesome-ai-agent-tools)
- **Browse Site**: [awesome-ai-agent-tools.vercel.app](https://awesome-ai-agent-tools.vercel.app)

## Topics

awesome, ai-agent-tools, ai-agents, skills, mcp-servers, model-context-protocol, agent-workflows, claude-code, opencode, codex, kilocode, cursor, gemini-cli, copilot, coding-agent, vibe-coding, prompt-engineering, skill-marketplace, agent-orchestration, cross-platform-ai, open-source-ai, developer-tools, subagents, hooks

## Updated

${today}
`;

  fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms, 'utf8');
}

function generateReadme() {
  const catalogs = CATALOGS.map((c) => ({ ...c, ...loadCatalog(c) }));
  const totalCount = catalogs.reduce((sum, c) => sum + c.count, 0);
  const categoryCount = catalogs.length;

  for (const cat of catalogs) {
    generateFolderReadme(cat, cat);
  }
  generateLlmstxt(catalogs);

  // Build TOC
  const toc = catalogs.map((c) => `- [${c.name}](#${c.name.toLowerCase().replace(/\s+/g, '-')})`).join('\n');

  // Build category detail sections
  const categoryDetails = catalogs.map((c) => {
    const catLines = c.categories
      .sort((a, b) => b.count - a.count)
      .map((cat) => `    - ${cat.name}: ${cat.count}`)
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
${catalogs.map((c) => `| **${c.name}** | ${c.count} | ${c.desc} | [${c.folder}/](${c.folder}/) |`).join('\n')}

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
  console.log(`Generated root README + ${catalogs.length} folder READMEs + llms.txt (${totalCount} total components)`);
}

generateReadme();