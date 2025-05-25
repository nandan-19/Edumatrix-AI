import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduMatrix AI | PDF Analysis & Question Answering",
  description:
    "Upload PDFs and get instant, accurate answers to your questions with our AI-powered document analysis tool.",
  keywords:
    "AI, PDF, document analysis, question answering, education, study helper",
  authors: [{ name: "EduMatrix Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "EduMatrix AI | PDF Analysis & Question Answering",
    description: "Upload PDFs and get instant, accurate answers with AI",
    url: "https://edumatrix.ai",
    siteName: "EduMatrix AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
