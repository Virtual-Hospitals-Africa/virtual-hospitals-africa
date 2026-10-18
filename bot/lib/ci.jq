# The verdict on a PR's checks, from `gh pr view --json headRefOid,statusCheckRollup` (bot/lib/pr.sh pr_ci):
# one tab-separated line — `passed <sha>`, `failed <sha> <names>`, `pending` or `none`. A check run
# carries a status and a conclusion; a commit status carries only a state.
def name: .name // .context;
def failed: (.conclusion // .state // "") | IN("FAILURE", "CANCELLED", "TIMED_OUT", "ACTION_REQUIRED", "STARTUP_FAILURE", "ERROR");
def unfinished: ((.status // "COMPLETED") != "COMPLETED") or ((.state // "") | IN("PENDING", "EXPECTED"));

.headRefOid as $sha
| (.statusCheckRollup // []) as $checks
| if ($checks | length) == 0 then "none"
  elif ($checks | map(select(failed)) | length) > 0 then ["failed", $sha, ($checks | map(select(failed) | name) | join(", "))] | @tsv
  elif ($checks | map(select(unfinished)) | length) > 0 then "pending"
  else ["passed", $sha] | @tsv
  end
