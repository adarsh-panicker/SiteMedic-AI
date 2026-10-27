import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteMedic AI — AI-Powered Website Audit & Repair",
  description:
    "Find website problems. Fix them with AI. Scan your website, investigate real issues, generate intelligent repairs, and verify your fixes before applying them.",
  keywords: ["website audit", "AI repair", "accessibility", "SEO", "broken links", "code quality"],
  authors: [{ name: "Adarsh Panicker" }],
  creator: "Adarsh Panicker",
  openGraph: {
    title: "SiteMedic AI",
    description: "Find Website Problems. Fix Them with AI.",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen" style={{ background: '#060b18', color: '#e2e8f0' }}>
        {children}
      </body>
    </html>
  );
}
