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
  title: "Fred's 5D Neural Network | C1 Coursework",
  description: "Modern interface for machine learning model training and predictions - fl482",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <Navbar />
          <main className="w-full min-h-[calc(100vh-4rem)] flex justify-center">
            <div className="w-full max-w-7xl px-8 py-12">
              {children}
            </div>
          </main>
        </AppProvider>
      </body>
    </html>
  );
}


