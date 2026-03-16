//layout.tsx

import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}