// Help for the APC 2026 review pages: the "?" buttons. Each entry is a short explanation; the
// fuller text is the same-named section of guide.html. Loaded by index.html and every page.
"use strict";
const HELP = {
  // ---- index columns ----
  page: ["Page", "The page number in the APC 2026 e-book. Each row is one page with a clinical red box."],
  title: ["Title", "The page's title in the e-book. Click it to open that page's review page. \"flowchart\" means the page has a flowchart file."],
  status_2023: ["Change since APC 2023", "Whether this page's red box changed between the 2023 and 2026 editions of the guide: changed, unchanged, changed only in numbers, wording or position, or new in 2026. A rough grouping made by a script that compared the two editions."],
  checks: ["Checks", "Whether the page's final rules pass the automated gate: VHA's parser, the SNOMED release, the database's limits, a cited element and verbatim quote for every condition, and our reading of Will's six constraints. A pass is not clinical review."],
  conditions: ["Conditions", "How many conditions the page's rules contain. A condition is one finding, test or comparison inside a rule, such as \"chest pain\" or \"no fever\". Each cites the page text it comes from."],
  elements: ["Page elements", "How many pieces of page text were extracted: each bullet, box line or flowchart node, inside the red box or outside it. Checkers judged each one."],
  agreement: ["Builder agreement", "How alike the two separate builds of this page were, from 0 to 1: the overlap of their exact conditions. Low agreement means the page is open to more than one reading."],
  queue: ["Queue", "How many items on this page a person should look at: anything a checker flagged, anything the checkers disagreed on, rule-level problems, builder disagreements and known issues."],
  high: ["High", "How many queue items are high priority: a checker said a page element is missing or wrong in the rules, said a condition is wrong or unsupported by the page, or reported a serious problem with a whole rule."],
  drafts: ["Decided here", "How many items you have decided on this page, in this browser. \"reconfirm\" counts decisions made on an older version of the rules."],

  // ---- page header ----
  hdr_queue: ["Review queue", "How many items on this page are in the review queue. They are listed in the Review queue tab at the bottom of the page."],
  hdr_decided: ["Decided", "How many conditions and red-box elements you have decided, out of all of them. Every one needs a person, not only the queued ones. Decisions stay in this browser until you export them."],
  hdr_2023: ["APC 2023 page", "The page in the 2023 edition of the guide that covers the same topic, and whether this page's red box changed since then. See the Edition context tab."],
  reviewer: ["Reviewer", "Your name. It is saved with every decision you make. Enter it before deciding anything."],
  role: ["Role", "Your role, saved with every decision: clinical, engineering or other. Only clinical decisions count as clinical sign-off, so choose before deciding."],
  export: ["Export decisions", "Saves your decisions on this page to a JSON file. Send the file to Tony, who adds it to the shared decision record."],

  // ---- panes ----
  cropband: ["The red box", "The red box cropped from the e-book page, at full width. Scroll inside it, or drag its bottom-right corner to resize it. Click a spot on it to highlight the matching text and conditions. Click the bar to hide it and give the panes more room; \"zoom to full size\" shows it at the page's own resolution."],
  source: ["Red box text, piece by piece", "The red box's text, extracted from the e-book one piece at a time: each bullet, line or flowchart step. Click a piece to highlight the conditions that cite it. Check the text against the red box above."],
  rules: ["Rules, in plain English", "The page's rules as VHA would run them, written out in English. Each condition shows where it came from and what the checkers said. Click a condition to highlight the page text it cites."],
  rawtoggle: ["Structured rules", "Switches between the rules in English and the rules as written in the rule file, laid out and colored the way a code editor shows them. Labels and decisions stay the same in both views."],
  chips: ["The small labels", "quote: the page words this condition cites, checked to be verbatim. builder: the builder's own confidence. checker 1–3: the verdicts of three AI checkers. On page text (left), they read the page and judged whether the rules encode it: correct, partial, missing or error. On conditions (right), three others read the rules and judged each against the page: faithful, imprecise, wrong or unsupported. Hover a label for its direction. builds differed: the two builds disagreed here. A SNOMED label shows the concept and how many narrower concepts also match it; a red one doesn't exist in VHA's SNOMED release."],
  decide: ["Deciding", "For a condition, or a page element the rules encode: accept, fix (say what in the note) or question. For a page element the rules don't encode: confirm out of scope, should be encoded, or question. Click a choice again to undo it."],

  // ---- rule parts ----
  when: ["When", "What must be true for the rule to apply: its evidence. \"all of\", \"any of\" and \"none of\" group conditions."],
  concludes: ["Concludes", "The diagnosis this rule suggests when its conditions are met."],
  do: ["Then", "What the task asks the health worker to do once it applies: check for findings, or take measurements."],

  // ---- tabs ----
  "Review queue": ["Review queue tab", "Every queued item on this page, high priority first. Click an item to jump to it in the panes above, where you decide it."],
  "Scope decisions": ["Scope decisions tab", "Red-box text the rules don't encode, with the builder's reason (for example, a management step) and the checkers' view. Confirm each, or say it should be encoded."],
  "Builder disagreements": ["Builder disagreements tab", "Where the two builds differed, which side the reconciler chose, and why."],
  "Edition context": ["Edition context tab", "This page's 2023 counterpart, and how the 2026 rules compare with Will's 2023 rules for it. A comparison of agreement, not a grade."],
  "Remaining questions": ["Remaining questions tab", "The builder's notes on this page: what the rules can't hold, where they fire more or less often than the page intends, and open questions for a clinician."],
  "Flowchart": ["Flowchart tab", "The builder's written version of the page's flowchart, made before the rules, so the rules follow the page's logic."],
  "Checker summaries": ["Checker summaries tab", "Each of the six checkers' overall summary of this page, and the problems they found with whole rules."],
  "Raw rule file": ["Raw rule file tab", "The page's rule file exactly as it would go into VHA."],

  // ---- table columns ----
  q_priority: ["Priority", "high, medium or low. High: a checker said something is wrong, missing or unsupported, or reported a serious rule problem. Medium: two checkers raised a partial objection, a checker reported a lesser rule problem, the builders' disagreement wasn't settled, a builder declared a known issue, or a rule was repaired after checking. Low: one checker's partial objection, or a settled builder disagreement."],
  q_kind: ["Kind", "What the item is: claim (a condition in the rules), element (a piece of page text), rule (a problem with a whole rule), build_disagreement, known_issue (declared by a builder), or post_check_repair (changed after the checkers read it)."],
  q_item: ["Item", "The text of the condition, page element or rule. Click it to jump to it above."],
  q_said: ["What they said", "Each checker's or builder's verdict and reason for this item."],
  bd_role: ["Role", "Where in the rule the difference sits: trigger, check-for, priority condition, diagnosis condition, diagnosis or measured item."],
  bd_difference: ["Difference", "The expression one build had and the other didn't, or wrote differently."],
  bd_choice: ["Choice", "What the reconciler kept: build A's version, B's, both, neither, or something new. \"unsettled\" means it wasn't sure."],
  bd_reason: ["Reason", "The reconciler's reason for its choice."],
  ec_role: ["Role", "Where in the rule the conditions sit: trigger, check-for, priority condition, diagnosis condition, diagnosis or measured item."],
  ec_2023: ["Only in 2023 rules", "Conditions in Will's 2023 rules for this page with no exact match in the 2026 rules."],
  ec_2026: ["Only in 2026 build", "Conditions in the 2026 rules with no exact match in Will's 2023 rules."],
  ec_related: ["Related", "Pairs where one side's concept is a narrower or broader SNOMED concept than the other's."],
};
function helpButton(key) {
  return HELP[key] ? `<button type="button" class="help" data-help="${key}" aria-label="What is this?" title="What is this?">?</button>` : "";
}
(function () {
  const css = document.createElement("style");
  css.textContent = `button.help { font: 600 11px/1 -apple-system, system-ui, sans-serif; width: 17px; height: 17px; padding: 0; margin-left: 4px; border-radius: 50%; border: 1px solid var(--muted); background: transparent; color: var(--muted); cursor: help; vertical-align: 1px; text-transform: none; letter-spacing: 0; }
button.help:hover, button.help:focus { border-color: var(--accent); color: var(--accent); }
#helppop { position: absolute; z-index: 50; max-width: min(360px, calc(100vw - 24px)); background: var(--panel); color: var(--ink); border: 1px solid var(--accent); border-radius: 8px; padding: 10px 12px; box-shadow: 0 4px 16px rgba(0,0,0,.18); font: 13px/1.45 -apple-system, system-ui, sans-serif; text-transform: none; letter-spacing: 0; font-weight: 400; white-space: normal; }
#helppop b { display: block; margin-bottom: 4px; }
#helppop a { display: inline-block; margin-top: 6px; }`;
  document.head.appendChild(css);
  let pop = null;
  const close = () => { if (pop) { pop.remove(); pop = null } };
  document.addEventListener("click", e => {
    const b = e.target.closest("button.help");
    if (!b) { if (pop && !e.target.closest("#helppop")) close(); return }
    e.preventDefault(); e.stopPropagation();
    const key = b.dataset.help, h = HELP[key];
    if (pop && pop.dataset.key === key) { close(); return }
    close();
    pop = document.createElement("div"); pop.id = "helppop"; pop.dataset.key = key; pop.setAttribute("role", "dialog");
    const anchor = "h-" + key.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    pop.innerHTML = `<b></b><span></span><br><a href="guide.html#${anchor}" target="_blank" rel="noopener">More in the reviewer's guide →</a>`;
    pop.querySelector("b").textContent = h[0]; pop.querySelector("span").textContent = h[1];
    document.body.appendChild(pop);
    const r = b.getBoundingClientRect();
    const left = Math.max(12, Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 12));
    pop.style.left = left + "px"; pop.style.top = (r.bottom + window.scrollY + 6) + "px";
  }, true);
  document.addEventListener("keydown", e => { if (e.key === "Escape") close() });
})();
