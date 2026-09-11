Create the folder mortgage-broker/ with one file: AUDIT-RULES.md.

It defines rules you must apply on every run of /mentionable-audit
and related Mentionable commands for a UK mortgage or property
business.

Write the file in English, in plain markdown, no preamble.

Contents:

## Before writing the priority actions section

- Check whether the brand already appears on a domain before
  recommending it as a link target. Cross-check ecosystem sources
  against the brand's own cited URLs.
- Never recommend buying links on government or public-body
  domains: moneyhelper.org.uk, gov.uk, fca.org.uk,
  citizensadvice.org.uk. They do not sell placements.
- Base backlink recommendations on list_backlink_opportunities
  only. Appearance counts in list_llm_sources are not purchase
  opportunities.

## In the fan-out table

- "Covered" must mean the brand is actually visible on that query,
  not that a tracked prompt exists for it. If the parent prompt has
  a mention rate below 30%, mark it "To work on".

## Always include

- An explicit list of prompts with 0% visibility across all LLMs.
  For a local service business this is the headline finding.
- A note on which LLMs expose fan-outs. Gemini, Google AIO and
  Google AI Mode do not, so fan-out tables reflect ChatGPT and
  Perplexity only.
- The data collection start date and the number of completed scans.
- Which LLMs the project actually covers. Never imply coverage of
  a platform that is not enabled on the project.

## Writing for the reader

The reader is a mortgage broker, not a marketer. Write so that
someone with no SEO background understands every line.

- Expand jargon on first use: fan-out, Share of Voice, citation,
  visibility rate, LLM. One short plain-English gloss each.
- Put one sentence under every table saying what it means in
  practice.
- State findings as consequences for the business, not as metrics.
  "You do not appear when someone asks ChatGPT for a broker in
  Polegate" beats "0% visibility on prompt 8".
- Never give a percentage without the raw count behind it.
- Short sentences. No marketing language. No filler.

## Regulatory

Clients are FCA regulated. Anything published is a financial
promotion. Never propose reviews, comments or posts written in the
voice of a customer. Flag anything that would need compliance
sign-off before publication.

## Claims

Never promise rankings, recommendations or leads. An audit is
diagnosis and planning. Never state that a report is ready to send
to the client without edits.

Then append one line to CLAUDE.md:
"Before running any Mentionable command for a UK mortgage broker
project, read mortgage-broker/AUDIT-RULES.md and apply it."

Show me both files before committing anything.
