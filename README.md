# strategy-brief

A reusable **Claude Code skill**: turn a strategic question into a rigorous, fully-sourced decision report **and** a concise, on-brand, unlisted web page whose every data-heavy claim is backed by a clear, data-honest graph and a clickable source — via a checkpointed multi-agent pipeline.

> Distilled from a real engagement (a founder's 6-week strategy → a sourced brief → a published page). The rules in `SKILL.md` are scar tissue: every fact cited, reliable-not-pitch, human-in-the-loop checkpoints, and **always run the graph-critic agent**.

## The pipeline

```
Scope ─▶ Research (parallel, web, every claim → URL) ─▶ Assess from primary artifacts
      ─▶ Synthesize (decision spine + plan, all numbers sourced/labeled)
      ─▶ Adversarial review gates ─▶ ★ human checkpoint ★
      ─▶ Write (brief + full sourced report) ─▶ Build page (data-honest graphs)
      ─▶ Graph-critic loop (render → agent judges → fix) ─▶ Deploy + verify
```

## Install

Copy the skill into your skills directory so Claude Code can discover it:

```bash
# personal (all projects)
mkdir -p ~/.claude/skills/strategy-brief
cp -R SKILL.md references ~/.claude/skills/strategy-brief/

# or per-project
mkdir -p .claude/skills/strategy-brief
cp -R SKILL.md references .claude/skills/strategy-brief/
```

Then invoke it in Claude Code with `/strategy-brief`, or just describe the task — the `description` in `SKILL.md` lets Claude pick it up automatically (e.g. *"research X and build me a funding-ready brief page"*).

## Contents

| File | What it is |
|---|---|
| `SKILL.md` | The orchestration guide: principles, the 8 phases, checkpoints, and the failure-modes-to-avoid. |
| `references/workflow.js` | A ready **Workflow** script (research → evidence-strength → synthesis → review gates → checkpoint). Edit the `SUBJECT` + prompts, run via the Workflow tool. |
| `references/graph-kit.css` | On-brand, **data-honest** chart components (scorecard, crowded-vs-sparse columns, gradient bars, heatmap, funnel, timeline, two-track, sources). Bars are gradient-on-track (never a collapsing child fill); value labels are dark and outside. |
| `references/page-kit.html` | A minimal scaffold wiring up each component the correct way. |
| `references/graph-critic.md` | Render commands (headless Chrome + sips), the per-figure rubric, and the known pitfalls + fixes. |
| `references/memory.md` | **mem0 wiring** — search prior lessons at the start, write new learnings at the end, so the skill self-improves. Uses `MEM0_API_KEY` (env var; never commit the key). |

## Principles (the short version)

1. Every fact/number carries a real source; tag `[self-report]` / `[secondary]` / `[assumption]`.
2. Reliable, not a pitch. Analysis is reference, not a verdict. State gaps plainly.
3. Human-in-the-loop checkpoints — approval before writing and before any page/deploy.
4. Honor confirmed facts; verify with primary sources where they exist.
5. **Actually run the graph-critic agent.** Unreviewed graphs ship broken.
6. Data-honest graphs: proportional, single-unit axes, readable labels.
7. One reader, one purpose.
8. **Self-improving** — load prior lessons + subject context from mem0 at the start, write new learnings at the end. Set `MEM0_API_KEY` in your environment to enable it (the key is never stored in this repo).

## License

MIT — see `LICENSE`.
