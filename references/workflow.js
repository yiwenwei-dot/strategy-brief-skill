// strategy-brief — Workflow template.
// Run with the Workflow tool: paste/adapt this, or save and run Workflow({scriptPath}).
// Edit SUBJECT + the per-agent prompts/schemas for your case. Keep the RULES.
//
// Pattern: research (parallel, web, every claim -> URL) -> evidence-based strengths
//          -> synthesis -> adversarial review gates -> final integrator.
// Returns a CHECKPOINT object to present to the human BEFORE writing prose/HTML.

export const meta = {
  name: 'strategy-brief-research',
  description: 'Deep research + evidence-based assessment + synthesis + adversarial review for a decision brief. Every claim sourced. Stops at a human checkpoint.',
  phases: [
    { title: 'Research', detail: 'parallel web agents; every claim -> primary URL' },
    { title: 'Assess', detail: 'strengths/position from primary artifacts vs self-report' },
    { title: 'Synthesize', detail: 'decision spine + options + plan, every number sourced/labeled' },
    { title: 'Review', detail: 'citation + devil + depth + comprehensiveness + audience-fit' },
    { title: 'Final', detail: 'apply must-fixes -> checkpoint brief + visual/data/source spec' },
  ],
}

// ---- EDIT THIS ----
const SUBJECT = `<<one paragraph: who/what, the question, the REAL numbers [self-report],
the audience for the output, the values/constraints, what "done" looks like.>>`

const RULES = `RIGOR + INTEGRITY. (1) Every non-obvious claim carries a real primary-source URL OR an explicit [self-report]/[secondary]/[assumption] tag. (2) No inflation/hype; reliable, not a pitch; analysis is reference, not verdict. (3) State gaps/risks plainly. (4) Honor the subject's confirmed facts; verify with a primary source where one exists. (5) Numbers traceable or labeled assumptions.`
const WEB = `Use WebSearch + WebFetch (load via ToolSearch: "select:WebSearch,WebFetch"). Every figure needs a real working URL. For pages WebFetch can't reach, note them for a curl fallback.`
const CITE = { type:'object', additionalProperties:false, properties:{
  items:{ type:'array', items:{ type:'object', additionalProperties:false, properties:{
    claim:{type:'string'}, figure:{type:'string'}, url:{type:'string'}, source:{type:'string'}, status:{type:'string'} },
    required:['claim','url','source','status'] } },
  verdict:{type:'string'}, count:{type:'integer'} }, required:['items','count'] }

phase('Research')
const RESEARCH_AGENTS = [
  { key:'supply',     ask:'MARKET SATURATION / supply: how crowded is the relevant space? competitors, funding, density. Verdict OVERSERVED/CONTESTED/OPEN.' },
  { key:'demand',     ask:'DEMAND x WILLINGNESS-TO-PAY across the candidate segments (ability != willingness; vitamin vs painkiller; who is the budget-holder). Verdict: highest demand x WTP for the subject value.' },
  { key:'benchmarks', ask:'BENCHMARKS: activation/retention, conversion, pricing comps, and what the target reader counts as success. Numbers with URLs.' },
  { key:'people',     ask:'The relevant PEOPLE / mentors / networks / programs: verified backgrounds + the concrete, specific help each can give. Cite each.' },
  { key:'positioning',ask:'POSITIONING + analogs: focused-niche-beats-broad cases; what wins; cautionary cases. Cite.' },
  { key:'evidence',   ask:'EVIDENCE HARVEST: read any provided draft/report; surface every existing source; then find a real primary URL for EVERY remaining load-bearing claim. Aim >=40 distinct URLs.' },
]
const research = (await parallel(RESEARCH_AGENTS.map(a => () =>
  agent(`${WEB}\n\n${RULES}\n\nSUBJECT:\n${SUBJECT}\n\nTASK — ${a.ask}\nReturn the CITE schema (claim+url+source+status; figure if numeric).`,
    { agentType:'general-purpose', schema:CITE, phase:'Research', label:`research:${a.key}` })
))).filter(Boolean)

phase('Assess')
const strengths = await agent(`${RULES}\n\nSUBJECT:\n${SUBJECT}\n\nEVIDENCE-BASED ASSESSMENT — do NOT rely on self-report. READ the subject's primary artifacts (portfolio/writing/records — list the paths you were given). Assess genuine strengths + honest gaps WITH a source/quote each; reconcile vs the self-report; flag any self-claim unsupported by evidence. Be objective, not flattering.`,
  { agentType:'general-purpose', phase:'Assess', label:'assess:strengths' })

phase('Synthesize')
const synthesis = await agent(`${RULES}\n\nSUBJECT:\n${SUBJECT}\n\nSYNTHESIZE the decision brief: (1) a clear GOAL (concrete target metrics if relevant); (2) the DECISION SPINE — a scored comparison matrix of the options/segments, every cell cited; (3) the recommended focus + honest trade-offs (lead with ONE primary; others as a labeled fork, not a co-equal menu); (4) a time-boxed PLAN with one headline number per period; (5) the RESOURCE/people LEVERAGE mapped to concrete asks. Every number sourced or labeled an assumption. Reliable, non-pitch.\n\nSTRENGTHS:\n${strengths}\n\nRESEARCH:\n${JSON.stringify(research)}`,
  { agentType:'general-purpose', phase:'Synthesize', label:'synth:brief' })

phase('Review')
const PANEL = { type:'object', additionalProperties:false, properties:{
  scores:{ type:'array', items:{ type:'object', additionalProperties:false, properties:{
    criterion:{type:'string'}, score:{type:'integer'}, issue:{type:'string'}, fix:{type:'string'} }, required:['criterion','score','issue','fix'] } },
  must_fix:{ type:'array', items:{type:'string'} } }, required:['scores','must_fix'] }
const reviews = (await parallel([
  () => agent(`CITATION-COMPLETENESS. Count distinct working URLs (state it). List every figure/fact without a URL or labeled assumption; flag inflated or unverifiable claims.\n\nBRIEF:\n${synthesis}\n\nRESEARCH:\n${JSON.stringify(research)}`, { schema:PANEL, phase:'Review', label:'review:citation' }),
  () => agent(`DEVIL'S ADVOCATE. Attack the recommendation. Where is a verdict convenient, a rate optimistic, an analog a poor fit, a risk understated? 3 riskiest assumptions + how to test each.\n\nBRIEF:\n${synthesis}`, { schema:PANEL, phase:'Review', label:'review:devil' }),
  () => agent(`DEPTH. Rate each section 1-5: mechanism + real numbers + the non-obvious trade-off, or shallow? Name shallow spots + a "go deeper" instruction.\n\nBRIEF:\n${synthesis}`, { schema:PANEL, phase:'Review', label:'review:depth' }),
  () => agent(`COMPREHENSIVENESS + OBJECTIVITY (pre-write gate). Is it balanced (no inflation/spin), complete, and does the recommendation FOLLOW from the data? Is anything missing? Reliable not pitchy? must_fix = changes required before writing.\n\nBRIEF:\n${synthesis}`, { schema:PANEL, phase:'Review', label:'review:comprehensiveness' }),
])).filter(Boolean)

phase('Final')
const VSPEC = { type:'object', additionalProperties:false, properties:{
  visuals:{ type:'array', items:{ type:'object', additionalProperties:false, properties:{
    id:{type:'string'}, title:{type:'string'}, chart_type:{type:'string'}, data:{type:'string'}, takeaway:{type:'string'}, source:{type:'string'} },
    required:['id','title','chart_type','data','takeaway','source'] } } }, required:['visuals'] }
const visualSpec = await agent(`${RULES}\n\nFor every data-heavy claim in the brief, spec a visual: id, title, chart_type, EXACT data values, one-line takeaway, and the source [n]+URL. Be exhaustive and exact — this is what the human reviews.\n\nBRIEF:\n${synthesis}`,
  { agentType:'general-purpose', schema:VSPEC, phase:'Final', label:'final:visual-spec' })
const checkpoint = await agent(`${RULES}\n\nFINAL editor. Apply EVERY must-fix from the reviews to the brief. Output the CHECKPOINT markdown: the brief + a "Visuals" table (Title | Chart | Exact data | Takeaway | Source) + a one-line note on what is still assumed/to-verify. This is presented to the human for approval BEFORE any prose/HTML.\n\nBRIEF:\n${synthesis}\n\nVISUAL SPEC:\n${JSON.stringify(visualSpec)}\n\nREVIEWS:\n${JSON.stringify(reviews)}`,
  { agentType:'general-purpose', phase:'Final', label:'final:checkpoint' })

return { checkpoint, visualSpec, reviews, sourceCount: research.map(r => r && r.count) }
