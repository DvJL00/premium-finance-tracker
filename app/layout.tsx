import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Finance Tracker",
  description: "Controle financeiro full stack com Next.js, Prisma e PostgreSQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}