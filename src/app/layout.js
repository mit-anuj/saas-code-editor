'use client'
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "../components/providers/ConvexClientProviders";
import "./globals.css";
import Footer from "../components/Footer";
import { Toaster } from "react-hot-toast";
import useMounted from "../hooks/useMounted";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  // const mounted = useMounted();
  // if(!mounted) return null;
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100 flex flex-col`}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>

          <Footer />

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
