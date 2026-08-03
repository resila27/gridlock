import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GRIDLOCK — A Battle of Words",
  description: "Find words, claim the grid, and surround letters to lock them for good.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "var sc_project=13339608;var sc_invisible=1;var sc_security=\"8b091880\";" }} />
        <script src="https://www.statcounter.com/counter/counter.js" async />
      </head>
      <body>
        {children}
        <noscript>
          <div className="statcounter">
            <a title="Web Analytics" href="https://statcounter.com/" target="_blank" rel="noreferrer">
              <img
                className="statcounter"
                src="https://c.statcounter.com/13339608/0/8b091880/1/"
                alt="Web Analytics"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </noscript>
      </body>
    </html>
  );
}
