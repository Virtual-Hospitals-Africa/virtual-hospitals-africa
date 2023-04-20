import { Options } from "$fresh/plugins/twind.ts";
import * as colors from "twind/colors";

export default {
  selfURL: import.meta.url,
  theme: {
    colors: {
      ...colors,
      primary: {
        "50": "#e2f5eb",
        "100": "#c5ebd2",
        "200": "#8cd8a5",
        "300": "#64c686",
        "400": "#3cad67",
        "500": "#219651",
        "600": "#00A859",
        "700": "#186e42",
        "800": "#145b3a",
        "900": "#104b32",
      },
      secondary: {
        "50": "#f3f3fa",
        "100": "#dcdcff",
        "200": "#b6b6fc",
        "300": "#8e8efc",
        "400": "#6c6cfb",
        "500": "#4a4afc",
        "600": "#3E4095",
        "700": "#32337e",
        "800": "#28286b",
        "900": "#1e1e58",
      },
    },
    fontFamily: {
      sans: ["Ubuntu", "sans-serif"],
      serif: ["Ubuntu", "serif"],
    },
  },
} as Options;
