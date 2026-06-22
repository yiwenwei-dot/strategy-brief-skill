# Memory (mem0) — make the pipeline self-improving

The skill uses [mem0](https://mem0.ai) so each run starts smarter: **search at the start, write learnings at the end.** No MCP needed — plain `curl`.

> **Secret hygiene:** never commit the API key. Read it from the env var `MEM0_API_KEY`. Keep the actual key in your local agent memory or a gitignored file — not in this repo.
> ```bash
> export MEM0_API_KEY="m0-…"   # set locally, e.g. in your shell profile
> ```

## Namespaces (`user_id`)

- `strategy-brief-skill` — **cross-run skill lessons** (graph/citation/tone/process learnings that apply to every engagement).
- `<subject>` (e.g. `turtletalk`) — **per-engagement context**: real numbers, confirmed facts, values/constraints, verified sources, decisions.

## Endpoints (v3)

- Add: `POST https://api.mem0.ai/v3/memories/add/`
- Search: `POST https://api.mem0.ai/v3/memories/search/`
- Auth header: `Authorization: Token $MEM0_API_KEY`
- Adds are async (`status: PENDING`); allow a few seconds before they're searchable.

## Phase 0 — load (start of every run)

Search BOTH namespaces and fold the hits into the agents' context (principles, prior failure-modes, subject facts, known sources):

```bash
curl -s -X POST https://api.mem0.ai/v3/memories/search/ \
  -H "Authorization: Token $MEM0_API_KEY" -H "Content-Type: application/json" \
  -d '{"query":"graphs, citations, tone, checkpoints — lessons for a strategy brief","user_id":"strategy-brief-skill","limit":15}'

curl -s -X POST https://api.mem0.ai/v3/memories/search/ \
  -H "Authorization: Token $MEM0_API_KEY" -H "Content-Type: application/json" \
  -d '{"query":"<subject>: real numbers, confirmed facts, values, verified sources","user_id":"<subject>","limit":20}'
```

## Phase 9 — persist (end of every run)

Write back what THIS run taught, so the next run benefits:

- **Skill lessons** → `user_id:"strategy-brief-skill"` — anything a critic/reviewer caught, a framing that worked/failed, a graph type that confused, an unreliable source pattern.
- **Subject facts** → `user_id:"<subject>"` — confirmed numbers, decisions made, sources verified (with reliability flag), the audience's stated preferences.

```bash
curl -s -X POST https://api.mem0.ai/v3/memories/add/ \
  -H "Authorization: Token $MEM0_API_KEY" -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"<one durable lesson or fact>"}],
       "user_id":"strategy-brief-skill","metadata":{"kind":"lesson"}}'
```

Keep entries atomic (one fact/lesson each), durable (not run-specific chatter), and honest (tag provenance on subject facts). Treat retrieved memories as background context to verify, not gospel — a remembered number may be stale; re-confirm load-bearing facts.

## What's already seeded (`strategy-brief-skill`)

The core principles + failure-modes from `SKILL.md` (sourcing, reliable-not-pitch, checkpoints, run-the-critic, gradient bars + dark labels outside, direct-link citations, honor-confirmed-facts, lead-with-one-recommendation, reader's-words). Future runs add to this.
