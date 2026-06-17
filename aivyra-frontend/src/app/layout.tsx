import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aivyra-Tutor - AI-Powered Rural Education Platform",
  description: "Bridging skill gaps in rural communities through personalized AI learning, interactive voice support, and progress analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
