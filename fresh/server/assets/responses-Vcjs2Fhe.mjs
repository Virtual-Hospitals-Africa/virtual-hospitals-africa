import { aA as humanReadableJson } from "../server-entry.mjs";
function json(data) {
  const response = new Response(JSON.stringify(data), {
    status: 200
  });
  response.headers.set("content-type", "application/json");
  return response;
}
json.humanReadable = function(data) {
  const response = new Response(humanReadableJson(data), {
    status: 200
  });
  response.headers.set("content-type", "application/json");
  return response;
};
function file(data, type) {
  const response = new Response(data, {
    status: 200
  });
  response.headers.set("content-type", type);
  return response;
}
export {
  file as f,
  json as j
};
