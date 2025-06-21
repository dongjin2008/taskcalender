import { Inter } from "next/font/google";
import { useEffect, useState } from "react";

// Define the font
const interFont = Inter({
  subsets: ["latin"],
  display: "swap",
});

// Utility to safely use the font in both environments
export function useSafeFont() {
  const [fontClass, setFontClass] = useState("");

  useEffect(() => {
    // Only apply the font on the client side
    setFontClass(interFont.className);
  }, []);

  return fontClass;
}

// Export the font for direct usage
export const fontClass = interFont.className;
