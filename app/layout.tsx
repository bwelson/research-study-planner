import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Study Planner",
  description: "Search academic papers and generate structured reading plans",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}