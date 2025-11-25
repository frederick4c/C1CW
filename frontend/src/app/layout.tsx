import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AppProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fred's Neural Network | C1 Coursework",
  description: "Modern interface for machine learning model training and predictions - fl482",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-[var(--background)] min-h-screen flex flex-col items-center py-8">
        <AppProvider>
          <div className="w-full max-w-5xl px-4 md:px-6 flex flex-col items-center">
            <Navbar />
            <main className="w-full flex flex-col items-center">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

