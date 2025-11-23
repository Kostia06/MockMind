import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MockMind - AI Interview Prep Platform",
  description: "Practice interviews with AI. Paste any job posting and get personalized mock interviews with real-time voice interaction, live transcription, and detailed feedback analysis.",
  keywords: ["interview prep", "mock interview", "AI interview", "job interview practice", "interview coaching", "career preparation"],
  authors: [{ name: "MockMind" }],
  creator: "MockMind",
  publisher: "MockMind",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mockmind.com",
    title: "MockMind - AI-Powered Interview Prep Platform",
    description: "Practice interviews with AI. Get personalized mock interviews with real-time voice interaction and detailed feedback.",
    siteName: "MockMind",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MockMind - AI-Powered Interview Prep Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MockMind - AI Interview Prep Platform",
    description: "Practice interviews with AI. Get personalized mock interviews with real-time voice interaction and detailed feedback.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
