import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Tippy - The modern way to send STX",
  description: "Send, bulk send, and tip in STX with ease on the Stacks blockchain.",
  other: {
    "talentapp:project_verification": "833f14c85e060ff3e4d3e527dd65d6a0d9eb1fdaed3f24f69e4937544b56b310265519812869781f0a92be3ff7c7278513947f28d8d3abdbcfc19a601d71ec75"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Navbar />
        <main className="pt-28 pb-12 px-4 min-h-screen">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
