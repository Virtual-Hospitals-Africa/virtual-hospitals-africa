# bot/lib/session.jq — one card.log line per thing a worker session says or does, from its Claude Code
# transcript, read raw (`jq -R -r -f`): what was typed to it (the bot's prompt, or you in its tmux
# window), what it says, each tool it calls, each tool that failed, and an API error.

def clip($n): gsub("\n"; " ⏎ ") | if length > $n then .[0:$n] + "…" else . end;
def gist: (.description // .command // .file_path // .pattern // .prompt // .url // tostring) | tostring | clip(160);
def result_text: if type == "array" then map(.text // "") | join(" ") else tostring end;

def render:
  if .type == "assistant" and .isApiErrorMessage == true then "✗ API: \(.message.content | result_text | clip(200))"
  elif .type == "assistant" then
    .message.content[]?
    | if .type == "text" then "💬 \(.text)"
      elif .type == "tool_use" then "→ \(.name): \(.input | gist)"
      else empty end
  elif .type == "user" and .isMeta != true and (.message.content | type) == "string" then
    "› \(.message.content | clip(200))"
  elif .type == "user" and (.message.content | type) == "array" then
    .message.content[] | select(.type == "tool_result" and .is_error == true) | "✗ \(.content | result_text | clip(200))"
  else empty end;

try fromjson catch null | select(type == "object") | render
