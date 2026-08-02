import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wordhold — A Battle of Words",
  description: "Find words, claim the field, and surround letters to hold them for good.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
