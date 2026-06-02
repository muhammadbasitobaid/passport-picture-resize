import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";

const fontSans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: ["system-ui", "arial"],
});

const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-display",
  fallback: ["system-ui", "arial"],
});

export const fonts = [fontSans.variable, fontDisplay.variable];
