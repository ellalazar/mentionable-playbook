# Getting started

5 minutes to get the Mentionable MCP connected to your AI agent and run your first command.

## 1. Create a Mentionable account

1. Sign up at [mentionable.ai](https://mentionable.ai)
2. Create a project (your site, your product, your client)
3. Add a few prompts to track (5-20 to start)
4. Let Mentionable collect data for 24-48h

> Without collected data, the MCP will return empty results — be patient while the first run happens.

## 2. Get your API key

In Mentionable → Settings → API → Create new key.

Keep it safe; it's only shown once.

## 3. Connect the MCP

The Mentionable MCP works with **any client that supports MCP**: Claude Code, Cursor, Claude Desktop, Codex CLI, etc.

Two authentication methods are available:

- **A. `Authorization` header (recommended)** — cleaner, safer
- **B. Key in query string (`?key=...`)** — simple fallback if header config gives you trouble

### Method A — Header auth (recommended)

#### Claude Code

```bash
claude mcp add mentionable \
  --transport http \
  --url https://mentionable.ai/api/mcp \
  --header "Authorization: Bearer $MENTIONABLE_API_KEY"
```

Check the installation:

```bash
claude mcp list
```

#### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mentionable": {
      "url": "https://mentionable.ai/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "mentionable": {
      "url": "https://mentionable.ai/api/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

Restart Claude Desktop.

### Method B — Query string auth (simple fallback)

**Video tutorial** — setting up the Mentionable MCP on Claude (web / desktop) and ChatGPT via a key in the URL:

[![Tutorial: setting up the Mentionable MCP via a key in the URL](https://img.youtube.com/vi/C1EbdAnwRRo/maxresdefault.jpg)](https://youtu.be/C1EbdAnwRRo?si=peBBhagn_e_e_rzj)

If you're struggling with the header config (an env variable that won't load, a config file that isn't picked up, a client that ignores `headers`), you can pass your key directly in the URL:

```
https://mentionable.ai/api/mcp?key=YOUR_API_KEY
```

#### Claude Code

```bash
claude mcp add mentionable \
  --transport http \
  --url "https://mentionable.ai/api/mcp?key=YOUR_API_KEY"
```

#### Cursor

```json
{
  "mcpServers": {
    "mentionable": {
      "url": "https://mentionable.ai/api/mcp?key=YOUR_API_KEY"
    }
  }
}
```

#### Claude Desktop

```json
{
  "mcpServers": {
    "mentionable": {
      "url": "https://mentionable.ai/api/mcp?key=YOUR_API_KEY"
    }
  }
}
```

> **Warning**: with method B, your API key ends up in cleartext in the config file and potentially in logs. Avoid it on shared machines. **Never commit a config file that contains this URL** — check your `.gitignore`.

## 4. Clone this repo

```bash
git clone https://github.com/mentionable-ai/mentionable-playbook.git
cd mentionable-playbook
```

If you use Claude Code, the **slash commands** in `.claude/commands/` are detected automatically as soon as you launch Claude Code in this folder.

## 5. First call

Two entry points, depending on what you want to do:

### A. Diagnose an existing project

```
/mentionable-audit
```

If you have several projects, specify which one:

```
/mentionable-audit my-project-name
```

### B. Start a content production run

```
/mentionable-clusters
```

This command clusters LLM fan-outs by topic + intent and produces a `clusters.json` file that acts as the bridge to `/mentionable-pillar` then `/mentionable-article`. It's the entry point of the full workflow (see [README.md](../README.md#full-workflow-from-llm-signal-to-published-article)).

### On another client (Cursor, Claude Desktop, etc.)

Open [`playbooks/01-audit-geo-initial.md`](../playbooks/01-audit-geo-initial.md), copy the prompt, and paste it into your chat. The agent will call the MCP tools and hand you back the audit. Every other playbook works the same way.

## Check that it works

If you get a structured markdown report, you're set.

If you get an error:

- `**No projects found**`: the MCP is connected but your API key sees no project → check the workspace linked to the key
- `**Unauthorized**`: the API key is invalid or expired → regenerate it
- `**Tool not found**`: the MCP isn't loaded → check `claude mcp list` or restart your client

## What's next

- Read the [GEO concepts](concepts.md) if you're getting started
- Browse the [tools reference](tools-reference.md)
- Explore the [12 playbooks](../playbooks/) — diagnostics, content production (pillar + satellites + GEO articles + images), outreach, reporting
- To produce content: follow the [recommended full workflow](../README.md#full-workflow-from-llm-signal-to-published-article) (clusters → pillar → article → images)
- Configure the prerequisites for the advanced commands: [DataForSEO](dataforseo-setup.md) (for `/mentionable-pillar`), [Gemini](images-setup.md) (for `/mentionable-images`)
