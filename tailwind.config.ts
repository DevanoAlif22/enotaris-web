import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        table:
          "-137px 153px 58px 0px rgba(17, 74, 100, 0.00), -88px 98px 53px 0px rgba(17, 74, 100, 0.00), -49px 55px 44px 0px rgba(17, 74, 100, 0.01), -22px 25px 33px 0px rgba(17, 74, 100, 0.02), -5px 6px 18px 0px rgba(17, 74, 100, 0.02)",
      },
      colors: {
        primary: "#0256c4",
        secondary: "#f7f7f7",
        tertiary: "#f5fefd",
      },
      fontFamily: {
        primary: ["Poppins", "sans-serif"],
      },
      container: {
        center: true, // auto center container
        screens: {
          sm: "640px",
          md: "880px",
          lg: "1024px",
          xl: "1280px",
        },
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "3rem",
          xl: "4rem",
          "2xl": "5rem",
        },
      },
      margin: {
        standard: "1.75rem", // typo: ubah "standart" → "standard"
      },
    },
  },
  plugins: [],
};

export default config;
