import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOND FM",
  description: "Upload and listen to music",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
