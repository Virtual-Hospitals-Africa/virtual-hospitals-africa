import { getLocationAddress } from "../external-clients/google.ts";

import { Location } from "../types.ts";

export default function getAddressString(locationCoordsObj: Location): string {
    const responsePromise = getLocationAddress(locationCoordsObj);
    responsePromise.then((response) => {
        console.log(response);
        return response
      }).catch((error) => {
        // Handle any errors that occurred during the promise execution
        console.error(error);
        return "Address unavailable"
      });
    return "Address unavailable"
}