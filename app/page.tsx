import Link from "next/link";
import { Sparkles, Layers, Swords } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-400 to-gold-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          Prompt Card Battler
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 font-light tracking-wide">
          Forge your destiny with words. Battle with AI-generated legends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        <Link href="/craft" className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-gold-500/50 transition-all hover:bg-slate-800/50 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-slate-950 border border-slate-800 group-hover:border-gold-500/50 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] transition-all">
              <Sparkles className="w-8 h-8 text-gold-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-200 group-hover:text-gold-400 transition-colors">Craft Cards</h2>
            <p className="text-slate-400 text-sm">Turn your imagination into playable cards using AI.</p>
          </div>
        </Link>

        <Link href="/deck" className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all hover:bg-slate-800/50 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-slate-950 border border-slate-800 group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
              <Layers className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-200 group-hover:text-blue-400 transition-colors">Build Deck</h2>
            <p className="text-slate-400 text-sm">Assemble your team of 5-8 champions.</p>
          </div>
        </Link>

        <Link href="/battle" className="group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-red-500/50 transition-all hover:bg-slate-800/50 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-slate-950 border border-slate-800 group-hover:border-red-500/50 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all">
              <Swords className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-200 group-hover:text-red-400 transition-colors">Battle</h2>
            <p className="text-slate-400 text-sm">Watch your deck fight in auto-battles.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
