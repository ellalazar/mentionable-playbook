# Contributing

Got a GEO workflow that works well with your clients? Want to add a use case, fix a typo, translate a playbook? Welcome.

## Adding a use case

A use case = **1 slash command + 1 .md playbook**.

### 1. Slash command

Create `.claude/commands/mentionable-<name>.md` with this skeleton:

```markdown
---
description: <one sentence describing the deliverable>
argument-hint: [optional-argument]
---

You are going to <clear objective>.

Argument provided: `$ARGUMENTS`

## Step 1 — <action>

[MCP call with precise inputs]

## Step 2 — <action>

[...]

## Step N — Produce the deliverable

Markdown format:

### <Title>

[exact structure of the output]

## Rules

- [quality constraints]
```

### 2. .md playbook

Create `playbooks/<NN>-<slug>.md` with:

- **Objective** (1 sentence)
- **For whom** (2-4 personas)
- **Requirements**
- **MCP tools used**
- **On Claude Code** (the slash command)
- **On another client** (the full prompt to copy)
- **Sample deliverable** (markdown of the expected output)
- **Variants** (filters, variations)
- **Going further** (links to complementary playbooks)

### 3. Update the README

Add your use case to the `Use cases included` table.

## Editorial principles

- **Agnostic**: no specific niche, generic examples (`[your industry]`, `your brand`)
- **Factual**: no invention. If a data point doesn't exist, say "not available"
- **Actionable**: a deliverable must be usable as-is (send to a client, copy-paste a backlog)
- **Short**: a playbook that runs past 200 lines is probably two playbooks
- **English** for the docs (French content is produced per project via the `language` setting)

## Process

1. Fork
2. Branch `feat/<use-case-name>`
3. PR with a description of the use case and a real sample deliverable (anonymized)
4. Review: we look at format + value + editorial quality

## Bugs and fixes

Issues welcome. For typo fixes, open a PR directly without an issue.

## Code of conduct

Be respectful, factual, sourced. No bashing of competing products.
