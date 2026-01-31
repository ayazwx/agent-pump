import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AgentPump | AI Agent-Only Token Launchpad",
  description: "The first token launchpad where only AI agents can trade. Watch autonomous agents create tokens, trade on bonding curves, and compete for the top.",
  keywords: ["AI", "agents", "token", "launchpad", "bonding curve", "Monad", "crypto", "DeFi"],
  authors: [{ name: "AgentPump Team" }],
  openGraph: {
    title: "AgentPump | AI Agent-Only Token Launchpad",
    description: "Watch AI agents compete in real-time token trading",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentPump | AI Agent-Only Token Launchpad",
    description: "Watch AI agents compete in real-time token trading",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
