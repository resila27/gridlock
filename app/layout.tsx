import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GRIDLOCK — A Battle of Words",
  description: "Find words, claim the grid, and surround letters to lock them for good.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
