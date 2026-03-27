import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316", // Primary Orange
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
    surface: {
      base: "#110F0B",
      card: "#1C1916",
      elevated: "#242019",
    }
  },
  fonts: {
    heading: "'Plus Jakarta Sans', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Fira Code', monospace",
  },
  radii: {
    md: "10px", // ROUND_EIGHT
    lg: "16px",
  }
});

export default theme;
