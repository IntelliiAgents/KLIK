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
          50: "#FAF7F0",
          100: "#F7F4EC", // Official warm ivory
          200: "#EFEBE0",
          300: "#E2DCCF",
          400: "#D1C8B6",
          500: "#B8AD96",
          DEFAULT: "#F7F4EC",
        },
        teal: {
          festival: "#263E47", // Official deep slate/teal primary dark
          accent: "#1997A3",   // Official coastal teal accent
          light: "#355460",
          dark: "#1A2B31",
          muted: "#4A6570",
        },
        terracotta: {
          festival: "#D75A35", // Official burnt terracotta
          light: "#E3704D",
          dark: "#B84523",
          muted: "#EAA28A",
        },
        mustard: {
          festival: "#D9A13E", // Official restrained mustard / ochre
          light: "#E5B65E",
          dark: "#B58125",
        },
        olive: {
          festival: "#747A57", // Official muted fynbos olive
          light: "#8B926C",
          dark: "#5A6042",
        },
        eucalyptus: {
          festival: "#747A57",
          light: "#8B926C",
          dark: "#5A6042",
        },
        ink: {
          festival: "#263E47", // Primary typography
          dark: "#162328",
          muted: "#5A6D75",
          light: "#86979F",
        },
      },
      fontFamily: {
        serif: [
          '"Iowan Old Style"',
          '"Palatino Linotype"',
          '"Book Antiqua"',
          "Palatino",
          "Georgia",
          "Cambria",
          "serif",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(38, 62, 71, 0.04), 0 1px 3px 0 rgba(38, 62, 71, 0.03)",
        card: "0 4px 14px -3px rgba(38, 62, 71, 0.07), 0 2px 5px -2px rgba(38, 62, 71, 0.04)",
        raised: "0 14px 28px -6px rgba(38, 62, 71, 0.12), 0 4px 10px -3px rgba(38, 62, 71, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
