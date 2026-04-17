import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TentaFinZap",
  description: "Controle financeiro inteligente",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}