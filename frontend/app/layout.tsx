
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SehatSaarthi - AI Healthcare Companion",
  description:
    "AI-powered healthcare assistant for symptom guidance, hospital discovery, and medical report analysis.",
  keywords: [
    "healthcare AI",
    "hospital finder",
    "medical assistant",
    "health India",
  ],
  openGraph: {
    title: "SehatSaarthi - AI Healthcare Companion",
    description: "Your AI-powered healthcare companion",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  );
}
