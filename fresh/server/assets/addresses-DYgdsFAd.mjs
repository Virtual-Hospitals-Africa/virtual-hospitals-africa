import { aX as HttpError, Q as compact, aY as uniq, aZ as COUNTRIES } from "../server-entry.mjs";
const isApartmentOrUnit = (word) => {
  const lower_word = word.toLowerCase();
  return lower_word === "apartment" || lower_word === "unit" || lower_word === "suite" || lower_word === "apt" || lower_word === "ste";
};
const TO_COUNTRY_ISO_3601_2 = /* @__PURE__ */ new Map();
const TO_COUNTRY_OFFICIAL_NAME = /* @__PURE__ */ new Map();
COUNTRIES.forEach((country) => {
  TO_COUNTRY_OFFICIAL_NAME.set(country.iso_3166_2, country.official_name);
  TO_COUNTRY_ISO_3601_2.set(country.official_name, country.iso_3166_2);
  for (const alternate_name of country.alternate_names || []) {
    TO_COUNTRY_ISO_3601_2.set(alternate_name, country.iso_3166_2);
  }
});
function formatAddress(address) {
  let {
    street_number,
    route,
    unit,
    street,
    country
  } = address;
  let country_full_name = country;
  let country_iso_3601 = country;
  if (TO_COUNTRY_ISO_3601_2.has(country)) {
    country_iso_3601 = TO_COUNTRY_ISO_3601_2.get(country);
  } else if (TO_COUNTRY_OFFICIAL_NAME.has(country)) {
    country_full_name = TO_COUNTRY_OFFICIAL_NAME.get(country);
  } else {
    throw new HttpError(400, `Unrecognized country ${country}`);
  }
  if (street && !route) {
    const street_parts = compact(street.split(" "));
    if (street_parts.length > 1 && !isNaN(parseInt(street_parts[0]))) {
      street_number = street_parts.shift();
    }
    const maybe_apt = street_parts[street_parts.length - 2];
    if (maybe_apt && isApartmentOrUnit(maybe_apt)) {
      const unit_number = street_parts.pop();
      const apt_description = street_parts.pop();
      unit = `${apt_description} ${unit_number}`;
    } else {
      const maybe_unit = street_parts[street_parts.length - 1];
      if (/\d/.test(maybe_unit)) {
        unit = street_parts.pop();
      }
    }
    route = street_parts.join(" ");
  }
  street = street || compact([street_number, route, unit]).join(" ") || void 0;
  const formatted = compact([street, ...uniq([address.locality, address.administrative_area_level_2, address.administrative_area_level_1]), country_full_name, address.postal_code]).join(", ");
  return {
    ...address,
    street,
    formatted,
    street_number,
    route,
    unit,
    country: country_iso_3601
  };
}
export {
  formatAddress as f
};
