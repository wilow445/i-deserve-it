import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Manrope"', "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#FBF6F0",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#2A1316", soft: "#5A3F44", muted: "#8B6F75" },
        rose: { DEFAULT: "#C8546B", deep: "#8B2D40" },
        blush: { DEFAULT: "#F8E1E7", soft: "#FBEDF1" },
        sage: "#7A8F6F",
        gold: "#B8924A",
        line: "#EADDD3",
      },
    },
  },
  plugins: [],
};

export default config;
