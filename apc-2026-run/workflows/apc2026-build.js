export const meta = {
  name: 'apc2026-build',
  description: 'Build APC 2026 red-box pages as VHA rules: 2 blind builds, reconcile, 3 forward + 3 backward blind checks per page',
  phases: [
    { title: 'Build', detail: 'two independent builders per page' },
    { title: 'Reconcile', detail: 'code diff, then one reconciler writes the final build' },
    { title: 'Check', detail: '3 forward + 3 backward blind checkers per page, mixed models' },
  ],
}

// The script that ran the 2026-11-04 build (shakedown run wf_15717c3a-b8c, main run wf_74bcbb85-f1a).
// One change since: ROOT comes from args.root, so it runs on any machine. To build more pages, in
// Claude Code with the Workflow tool:
//   Workflow({scriptPath: 'apc-2026-full/workflows/apc2026-build.js',
//             args: {root: '<absolute path to apc-2026-full>', pages: [{page, slug, title}, ...]}})
// Pages come from manifest.json (page, slug, title). Prerequisites: SETUP.md.
const ROOT = (args && args.root) || '/Users/syncytium/Developer/vha-work/apc-2026-full'
const CHECKER_MODELS = ['fable', 'sonnet', 'opus']

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    pass: { type: 'boolean', description: 'true only if the last page_check.sh printed PASS' },
    summary_line: { type: 'string' },
    rule_counts: { type: 'string' },
    least_confident: { type: 'array', items: { type: 'string' } },
    tool_problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'summary_line'],
}
const REC_SCHEMA = {
  type: 'object',
  properties: {
    pass: { type: 'boolean', description: 'true only if finalize_page.sh exited 0 and printed PASS' },
    summary_line: { type: 'string' },
    choices: { type: 'string', description: 'number of differences by choice' },
    unsettled: { type: 'array', items: { type: 'string' } },
    tool_problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'summary_line'],
}
const CHECK_SCHEMA = {
  type: 'object',
  properties: {
    wrote_file: { type: 'boolean' },
    counts: { type: 'string' },
    top_problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['wrote_file', 'counts'],
}

function builderPrompt(p, run) {
  return `You are builder ${run} for APC 2026 page ${p.page} ("${p.title}", slug \`${p.slug}\`).

Read and follow the brief at ${ROOT}/briefs/builder.md exactly, including its list of files you may and may not open. In particular, never open ${ROOT}/build/ folders other than your own.

Your output folder is ${ROOT}/build/${run}/${p.slug}/ (create it). Write only there. Page number for the tools: ${p.page}.

Finish only when \`sh ${ROOT}/tools/page_check.sh ${ROOT}/build/${run}/${p.slug} ${p.page}\` prints PASS (or you are certain it cannot honestly pass; then say why). In tool_problems, report any tool or brief problem you hit (exact command and error), or leave it empty.`
}

function reconcilerPrompt(p, a, b) {
  const status = `Builder A: ${a ? (a.pass ? 'passed' : 'did NOT pass: ' + a.summary_line) : 'failed to run'}. Builder B: ${b ? (b.pass ? 'passed' : 'did NOT pass: ' + b.summary_line) : 'failed to run'}.`
  return `You are the reconciler for APC 2026 page ${p.page} ("${p.title}", slug \`${p.slug}\`).

Read and follow the brief at ${ROOT}/briefs/reconciler.md. ${status}
If one build is missing or failed, make the final build from the other one (fixing it if needed), say so in reconcile.json "notes", and treat every condition as unsettled-by-design only where the page is ambiguous.

Steps:
1. Run \`sh ${ROOT}/tools/prepare_reconcile.sh ${p.slug} ${p.page}\`. It re-checks both builds and writes ${ROOT}/build/final/${p.slug}/diff.json (skip the diff if a build is missing).
2. Write the final build into ${ROOT}/build/final/${p.slug}/ (same file names as a builder's) plus reconcile.json there.
3. Use \`sh ${ROOT}/tools/page_check.sh ${ROOT}/build/final/${p.slug} ${p.page}\` and the provenance skeleton tool while you work.
4. Finish by running \`sh ${ROOT}/tools/finalize_page.sh ${p.slug} ${p.page}\`. It must exit 0 and print PASS; it also writes the blind checker inputs and the English rendering.

Write only inside ${ROOT}/build/final/${p.slug}/ (the finalize script writes ${ROOT}/checks/${p.slug}/input/ itself).`
}

function forwardPrompt(p, i) {
  return `You are forward checker ${i} for APC 2026 page ${p.page} ("${p.title}").

Read and follow the brief at ${ROOT}/briefs/forward-checker.md, including what you may not open.
The rules to check: ${ROOT}/checks/${p.slug}/input/${p.slug}.lisp. The page: ${ROOT}/inputs/2026/p${p.page}.png, p${p.page}-box*.png, p${p.page}.md, p${p.page}.json.
Do NOT open the claims file, anything under ${ROOT}/build/, or any other checker's output.
Write your report to ${ROOT}/checks/${p.slug}/forward-${i}.json with "checker": "forward-${i}". Write nothing else.`
}

function backwardPrompt(p, i) {
  return `You are backward checker ${i} for APC 2026 page ${p.page} ("${p.title}").

Read and follow the brief at ${ROOT}/briefs/backward-checker.md, including what you may not open.
The rules: ${ROOT}/checks/${p.slug}/input/${p.slug}.lisp. The claims: ${ROOT}/checks/${p.slug}/input/${p.slug}.claims.json. The page: ${ROOT}/inputs/2026/p${p.page}.png, p${p.page}-box*.png, p${p.page}.md, p${p.page}.json.
Do NOT open anything under ${ROOT}/build/, or any other checker's output.
Write your report to ${ROOT}/checks/${p.slug}/backward-${i}.json with "checker": "backward-${i}". Write nothing else.`
}

const pages = args.pages
log(`${pages.length} pages: ${pages.map(p => p.page).join(', ')}`)

const results = await pipeline(
  pages,
  async (p) => {
    const [a, b] = await parallel(['A', 'B'].map(run => () =>
      agent(builderPrompt(p, run), { label: `build ${run} p${p.page}`, phase: 'Build', schema: BUILD_SCHEMA })))
    if (!(a && a.pass) && !(b && b.pass)) log(`p${p.page}: neither build passed; the reconciler will try`)
    return { a, b }
  },
  async (builds, p) => {
    const rec = await agent(reconcilerPrompt(p, builds.a, builds.b), { label: `reconcile p${p.page}`, phase: 'Reconcile', schema: REC_SCHEMA })
    if (!rec || !rec.pass) {
      log(`p${p.page}: final build did not pass (${rec ? rec.summary_line : 'reconciler failed'}); checks skipped`)
      return { ...builds, rec, checks: null }
    }
    return { ...builds, rec }
  },
  async (st, p) => {
    if (!st.rec || !st.rec.pass) return { page: p.page, slug: p.slug, ...st }
    const checks = await parallel([1, 2, 3].flatMap(i => [
      () => agent(forwardPrompt(p, i), { label: `forward-${i} p${p.page}`, phase: 'Check', schema: CHECK_SCHEMA, model: CHECKER_MODELS[i - 1] }),
      () => agent(backwardPrompt(p, i), { label: `backward-${i} p${p.page}`, phase: 'Check', schema: CHECK_SCHEMA, model: CHECKER_MODELS[i - 1] }),
    ]))
    const wrote = checks.filter(c => c && c.wrote_file).length
    log(`p${p.page}: final ${st.rec.summary_line.slice(0, 40)}; ${wrote}/6 checker reports`)
    return { page: p.page, slug: p.slug, ...st, checks }
  },
)

return results.map((r, i) => r ? {
  page: r.page, slug: r.slug,
  A: r.a && { pass: r.a.pass, line: r.a.summary_line, tool_problems: r.a.tool_problems },
  B: r.b && { pass: r.b.pass, line: r.b.summary_line, tool_problems: r.b.tool_problems },
  final: r.rec && { pass: r.rec.pass, line: r.rec.summary_line, choices: r.rec.choices, unsettled: r.rec.unsettled, tool_problems: r.rec.tool_problems },
  checks: (r.checks || []).map(c => c && { wrote: c.wrote_file, counts: c.counts, top: c.top_problems }),
} : { page: pages[i].page, failed: true })
