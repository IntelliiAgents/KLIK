import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#FCFAF6",
          100: "#F8F4EB",
          200: "#EFE8DC",
          300: "#E3D8C6",
          400: "#D4C5AC",
          500: "#BFA889",
          DEFAULT: "#FAF6EE",
        },
        teal: {
          festival: "#133D4B",
          light: "#215364",
          dark: "#0C2731",
          muted: "#355964",
        },
        terracotta: {
          festival: "#C8522C",
          light: "#D86B47",
          dark: "#A53C19",
        },
        mustard: {
          festival: "#DE9E36",
          light: "#E7B256",
          dark: "#BD7F21",
        },
        eucalyptus: {
          festival: "#4B6354",
          light: "#617C6B",
          dark: "#37493E",
        },
        protea: {
          festival: "#D33E36",
          light: "#DE5A53",
          dark: "#A82B24",
        },
        ink: {
          festival: "#1A2228",
          muted: "#4A5660",
          light: "#72808D",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 8px -2px rgba(19, 61, 75, 0.08), 0 1px 4px -1px rgba(19, 61, 75, 0.04)",
        card: "0 4px 14px -3px rgba(19, 61, 75, 0.12), 0 2px 6px -2px rgba(19, 61, 75, 0.06)",
        raised: "0 10px 25px -5px rgba(19, 61, 75, 0.15), 0 8px 10px -6px rgba(19, 61, 75, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
