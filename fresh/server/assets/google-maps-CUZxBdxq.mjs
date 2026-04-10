import { m as assert } from "../server-entry.mjs";
import { f as formatAddress } from "./addresses-DYgdsFAd.mjs";
const USE_DOCKER_QUICKSTART = Deno.env.has("USE_DOCKER_QUICKSTART");
const NO_EXTERNAL_CONNECT = Deno.env.has("NO_EXTERNAL_CONNECT");
function getEnvVariableRequiredOutsideDockerQuickstart(name) {
  const value = Deno.env.get(name);
  if (!USE_DOCKER_QUICKSTART && !NO_EXTERNAL_CONNECT) {
    assert(value, `Must have ${name} environment variable set`);
  }
  return value;
}
const GOOGLE_MAPS_API_KEY = getEnvVariableRequiredOutsideDockerQuickstart("GOOGLE_MAPS_API_KEY");
const types_we_care_about = /* @__PURE__ */ new Set(["administrative_area_level_1", "administrative_area_level_2", "country", "locality", "postal_code", "route", "street_number"]);
async function getAddressSuggestions(input, options) {
  if (!input.trim()) return [];
  const params = new URLSearchParams({
    input,
    key: GOOGLE_MAPS_API_KEY
  });
  if (options?.location) {
    params.append("location", `${options.location.latitude},${options.location.longitude}`);
    params.append("radius", String(options.radius || 5e4));
  }
  if (options?.country) {
    params.append("components", `country:${options.country}`);
  }
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch address suggestions");
  }
  const data = await response.json();
  console.log("Places autocomplete:", {
    status: data.status,
    error_message: data.error_message,
    input,
    hasKey: !!GOOGLE_MAPS_API_KEY,
    keyLen: GOOGLE_MAPS_API_KEY?.length
  });
  if (data.status === "OK" && Array.isArray(data.predictions)) {
    return data.predictions;
  }
  return [];
}
async function getPlaceDetails(google_maps_place_id) {
  if (Deno.env.get("IS_TEST")) {
    return {
      google_maps_place_id,
      country: "ZA",
      locality: "Cape Town",
      street: "123 Main St",
      administrative_area_level_1: "Western Cape",
      administrative_area_level_2: "City of Cape Town",
      route: "Main St",
      street_number: "123",
      postal_code: "8000",
      unit: null
    };
  }
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${google_maps_place_id}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch place details");
  }
  const data = await response.json();
  console.log("Place details response:", {
    status: data.status,
    error_message: data.error_message,
    place_id: google_maps_place_id
  });
  if (data.status !== "OK" || !data.result) {
    console.error("Failed to get place details:", data.status, data.error_message);
    return null;
  }
  const address_components = data.result.address_components || [];
  const components = {};
  for (const component of address_components) {
    for (const type of component.types) {
      if (types_we_care_about.has(type)) {
        components[type] = component.long_name;
      }
    }
  }
  const street = components.route || components.street_number ? `${components.street_number || ""} ${components.route || ""}`.trim() : "";
  return formatAddress({
    street,
    google_maps_place_id,
    locality: components.locality || "",
    administrative_area_level_2: components.administrative_area_level_2,
    administrative_area_level_1: components.administrative_area_level_1,
    country: components.country || "",
    postal_code: components.postal_code,
    route: components.route,
    street_number: components.street_number,
    unit: void 0
  });
}
export {
  getAddressSuggestions as a,
  getPlaceDetails as g
};
