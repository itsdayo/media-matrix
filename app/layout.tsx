import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Matrix - AI Photo Generator",
  description:
    "Transform your ideas into stunning visuals with our advanced AI photo generator",
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
        <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Media Matrix
                </h1>
              </div>
              <div className="flex space-x-8">
                <a
                  href="/"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Generate
                </a>
                <a
                  href="/gallery"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Gallery
                </a>
                <a
                  href="#"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 text-sm font-medium"
                >
                  About
                </a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
