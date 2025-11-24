import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "プロンプト・カードバトラー",
  description: "AI搭載トレーディングカードゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${cinzel.variable} font-sans antialiased`} suppressHydrationWarning>
        <nav className="p-4 bg-slate-950/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-serif font-bold text-gold-500 tracking-wider">
              Prompt Card Battler
            </Link>
            <div className="space-x-6 font-semibold text-slate-300">
              <Link href="/craft" className="hover:text-white transition-colors">カード作成</Link>
              <Link href="/deck" className="hover:text-white transition-colors">デッキ編成</Link>
              <Link href="/battle" className="hover:text-white transition-colors">バトル</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4 min-h-[calc(100vh-80px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
