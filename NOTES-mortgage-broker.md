# Notes — UK mortgage broker niche

Working notes for running these playbooks on local UK mortgage brokers.
First compiled 11 Sept 2026 from the Quanstrom Financial test project.

## What the data looked like

- 40 tracked prompts, GB, five LLMs: ChatGPT, Perplexity, Gemini, Google AIO, Google AI Mode
- Visibility splits cleanly by prompt type:
  - brand prompts (name, reviews, FCA check, vs competitor) — near 100%
  - local prompts naming the home town — strong
  - neighbouring towns — weak to zero
  - UK-wide "how does X work" prompts — zero

## Sources that matter in this niche

| Domain | Role |
|---|---|
| moneyhelper.org.uk | dominates every informational query |
| gov.uk | SA302, Self Assessment, how-to-buy |
| unbiased.co.uk | adviser directory, profiles get cited |
| yell.com | business listing, cited verbatim |
| uk.trustpilot.com | reviews |
| ratingsplus.co.uk | reviews aggregator |
| fca.org.uk | regulatory checks |
| reddit.com | local recommendation threads |
| Lender guides (NatWest, Halifax, Lloyds) | cited on criteria questions |

## Lessons

- Fan-outs come almost entirely from ChatGPT, with a few from Perplexity.
  Gemini and the two Google surfaces expose none. Plan accordingly.
- A single well-written homepage can carry a competitor's whole visibility.
  Check the homepage before planning any link building.
- Google Business Profile is the second channel that actually moves the needle.
- Backlink marketplace offers in this niche are thin and poorly matched.
  Free directory listings beat them.
- Location pages replicate cheaply and fix neighbouring-town gaps.

## Compliance

Brokers are FCA regulated. Anything published is a financial promotion:
needs sign-off, needs the required disclaimers. Never post reviews or
comments written in the voice of a customer.

## Prompt set to reuse

Brand, reviews, FCA check, competitor comparisons, home town, neighbouring
towns, and one prompt per borrower type: first time buyer, home mover,
self-employed, contractor, company director, landlord, remortgage,
debt consolidation, new build.
