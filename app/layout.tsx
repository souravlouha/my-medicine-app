import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedTrace",
  description: "Medicine Authentication System",
  icons: {
    icon: "/medtrace-logo.png", // ✅ লোগো আইকন হিসেবে সেট করা হয়েছে
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ✅ suppressHydrationWarning যোগ করা হয়েছে */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}