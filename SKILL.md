---
name: strategy-brief
description: This skill should be used when the user wants a deeply-researched, fully-sourced strategy/decision report AND/OR an on-brand unlisted web page with cited, data-honest graphs — e.g. "research X and build me a plan/brief/report", "turn this into a page at <domain>/<path>", "make a funding-ready brief", "build a decision brief with graphs". Runs a checkpointed multi-agent pipeline: deep web research → evidence-based assessment → synthesis → adversarial review → human checkpoints → reliable (non-pitch) writing → graph-rich page → graph-critic loop → deploy.
version: 1.0.0
---

# Strategy Brief Pipeline

Turn a question (a founder's situation, a market, a strategic fork) into (1) a rigorous, every-line-cited decision report and (2) a concise, on-brand, unlisted web page whose every data-heavy claim is backed by a clear, data-honest graph and a clickable source.

Built from a real engagement; the rules below are scar tissue — follow them.

## Non-negotiable principles

1. **Every fact/number carries a real source.** Tag provenance on each: `[self-report]` (subject's own figures), `[secondary]` (industry data; flag aggregator/vendor/directional), `[assumption]` (modeled). A dedicated *evidence-harvest* agent maps each claim → a working primary URL. Do not let a hedge tag substitute for a source.
2. **Reliable, not a pitch.** The page earns respect through clarity and honesty, not salesmanship. No "why it's worth your time", no inflation, no fake scarcity. Analysis is *reference for the decision-maker*, not a verdict. State gaps and risks plainly — they build credibility.
3. **Human-in-the-loop checkpoints.** Show the human the analysis at each major stage and **get approval before moving on** — especially before writing and before building/deploying any page. Never silently jump stages.
4. **Honor the subject's confirmed facts; verify with primary sources when available.** Do not over-hedge a founder-confirmed credential into oblivion. But when a real primary source exists (a government page, an official record), fetch it and cite it (e.g. a teacher-training claim verified against an education-bureau page).
5. **Actually run the graph-critic agent.** The single biggest failure mode is *eyeballing the graphs yourself and skipping the review agent.* Render the page to images and have an agent judge every graph. Unreviewed graphs ship broken.
6. **Data-honest graphs.** Bars proportional on a real shared axis; never mix units on one axis; never put white labels on light fills; label every axis. See `references/graph-kit.css` — it is data-honest by construction.
7. **Audience-aware framing.** Write for the actual reader (a mentor? an investor? the founder?). One reader, one purpose.
8. **Remember across runs.** Load prior lessons + subject context at the start and write new learnings at the end (mem0; see `references/memory.md`). The skill should get *better every time*, not repeat its mistakes.

## The pipeline

Use the **Workflow** tool for the multi-agent stages (it gives deterministic fan-out + adversarial review). `references/workflow.js` is a ready template — adapt its prompts/schemas to the subject. Phases:

**Phase 0 — Load memory + scope.** First **search mem0** (`references/memory.md`) for prior skill lessons (`user_id: strategy-brief-skill`) and any saved context on this subject (`user_id: <subject>`); fold the hits into the agents' context. Then scope with the human: the question, the goal, the real numbers, the audience, the values/constraints, what "done" looks like. Ask clarifying questions. **Checkpoint: confirm scope before research.**

**Phase 1 — Research** (parallel, web-enabled agents; each returns claims with working URLs). Typical agents: market saturation/supply · demand & willingness-to-pay · benchmarks (conversion/retention/pricing) · the relevant people/mentors/networks · positioning/analogs · regulatory · **evidence-harvest** (every load-bearing claim → primary URL; target ≥40 distinct sources). Use `WebSearch`/`WebFetch` (load via ToolSearch). For pages WebFetch can't reach (e.g. gov sites without HTTPS), `curl` directly and strip tags.

**Phase 2 — Assess from evidence.** An agent reads the subject's *primary artifacts* (portfolio, writing, records) to assess strengths/position from evidence, then reconciles vs. self-report. Don't rely on self-assessment alone.

**Phase 3 — Synthesize.** The decision spine (e.g. a demand×supply / scored matrix), positioning, options/north-stars, the time-boxed plan, the resource/mentor leverage — **every number traced to a source or labeled an assumption.**

**Phase 4 — Adversarial review** (parallel gates; run them, don't skip): citation-completeness · devil's-advocate · depth · positioning-soundness · resource-maximization · **comprehensiveness & objectivity** · audience/founder-fit. Each returns scored findings + must-fixes; a final editor applies them.

**Checkpoint:** present the synthesized brief + the visual/data/source spec + the eval scorecard. **Get approval before writing prose or any HTML.** Save it as `CHECKPOINT-*.md` for the human to mark up.

**Phase 5 — Write.** The distilled brief (for the page) + a full sourced report (linked for depth). Reliable register; provenance tags; clickable sources.

**Phase 6 — Build the page.** Use `references/page-kit.html` (on-brand scaffold + the data-honest graph component library). Keep it concise: tight prose, a graph wherever data is heavy, a clear logic flow, clickable sources that link **directly to the external source** (not an on-page anchor), a link to the full report, and `<meta name="robots" content="noindex,nofollow">` if unlisted. Copy the full report into the site and link it.

**Phase 7 — Graph-critic loop.** Render → critique → fix → repeat. See `references/graph-critic.md` for the exact render commands and rubric. Do not skip.

**Phase 8 — Deploy + verify.** Deploy (e.g. `vercel --prod --yes` from the site dir). Then **curl-verify live**: 200, `noindex` present, key content present, every link resolves, page absent from sitemap if unlisted.

**Phase 9 — Persist learnings.** Write back to mem0 what this run taught (`references/memory.md`): durable **skill lessons** (critic findings, framings that worked/failed) → `strategy-brief-skill`; verified **subject facts + sources** → `<subject>`. This is what makes the next run start smarter.

## Reference files

- `references/workflow.js` — adaptable Workflow script: research → evidence-strength → synthesis → review-gates → final. Edit prompts/schemas, then run via the Workflow tool (or `Workflow({scriptPath})`).
- `references/graph-kit.css` + `references/page-kit.html` — the proven on-brand design system and **data-honest** graph components (scorecard, crowded-vs-sparse columns, gradient bars, heatmap, funnel, timeline, two-track diagram, dense table). Bars are painted as a gradient on the track (NOT a child `width:%` fill — that collapses); value labels are dark and sit *outside* the bar.
- `references/graph-critic.md` — render commands (headless-Chrome screenshot + `sips` crop) and the per-figure rubric + known pitfalls.
- `references/memory.md` — mem0 wiring (search at start, write at end; `MEM0_API_KEY` env var) so the skill self-improves across runs.

## Common failure modes (seen for real → fixed)

- **Skipping the critic agent** → a chart with white labels on a near-white fill shipped invisibly. *Always run the agent.*
- **Child-element `width:%` bar fills** silently collapse (height:100% with no height context). *Paint the bar as a gradient on the track instead.*
- **Inline `[n]` citations jumping to an on-page list** feel broken. *Link each citation straight to its source URL, target=_blank.*
- **Over-hedging a confirmed credential** ("not used as proof, pending…") reads as evasive when the subject confirms it and a primary source exists. *Verify and state it.*
- **Internal jargon in the asset list** ("Moments-reachable") instead of plain "1,873 friends / 473 followers". *Use the reader's words.*
- **Presenting N co-equal options as a menu** ("pick one") reads as indecision. *Lead with one primary; make the rest a clearly-labeled fork/appendix.*
- **Letting a metric/goal drift to "raise-ready"** when the subject is bootstrap-first. *State the goal as the subject's, with a concrete scorecard of targets.*

## Scaling

Match effort to the ask. A quick brief: a few research agents, single-vote review. "Comprehensive / rigorous / fund-ready": larger research pool, 3–5 review gates, the full graph-critic loop. When unsure, lean thorough for research/strategy and concise for the page itself.
