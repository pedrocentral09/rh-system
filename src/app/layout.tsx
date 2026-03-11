import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Família RH | Sistema de Gestão Inteligente",
  description: "Plataforma avançada de gestão de pessoas e portal do colaborador. Eficiência, transparência e tecnologia para sua empresa.",
  keywords: ["RH", "Gestão de Pessoas", "Recursos Humanos", "Portal do Colaborador", "Família RH"],
  authors: [{ name: "Família RH" }],
  openGraph: {
    title: "Família RH | Sistema de Gestão Inteligente",
    description: "Plataforma avançada de gestão de pessoas e portal do colaborador.",
    url: "https://rh.familiaderly.com.br",
    siteName: "Família RH",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Família RH | Sistema de Gestão Inteligente",
    description: "Plataforma avançada de gestão de pessoas e portal do colaborador.",
  },
  appleWebApp: {
    title: "Família RH",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport = {
  themeColor: "#0f1115",
  width: "device-width",
  initialScale: 1,
};

import { ThemeProvider } from '@/shared/providers/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
