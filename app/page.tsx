import Link from "next/link";
import { Sparkles, Layers, Swords, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center space-y-16 relative">
      {/* Hero Section */}
      <div className="space-y-8 max-w-4xl relative z-10">
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-3xl bg-[#ffd700]/20 rounded-full" />
          <h1 className="relative text-6xl md:text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] via-[#eab308] to-[#ca8a04] drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] leading-tight py-2">
            Prompt<br/>Card Battler
          </h1>
        </div>
        <p className="text-xl md:text-3xl text-[#d8c8a8] font-light tracking-wide drop-shadow-md">
          言葉で運命を切り拓け。<br className="md:hidden"/> AIが生み出す伝説と共に戦え。
        </p>
        
        <div className="pt-4">
          <Link 
            href="/craft" 
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#ca8a04] to-[#eab308] hover:from-[#eab308] hover:to-[#facc15] text-slate-950 font-bold text-xl py-4 px-10 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 active:scale-95"
          >
            <Sparkles size={24} />
            <span>伝説を創造する</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 relative z-10">
        <Link href="/craft" className="group relative p-8 rounded-2xl bg-slate-950/60 border border-[#c5a000]/20 hover:border-[#c5a000] transition-all hover:bg-slate-900/80 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="p-5 rounded-full bg-slate-950 border border-[#c5a000]/30 group-hover:border-[#ffd700] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all duration-500">
              <Sparkles className="w-10 h-10 text-[#ffd700]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#f0e6d2] group-hover:text-[#ffd700] transition-colors">カード作成</h2>
            <p className="text-[#d8c8a8] text-sm leading-relaxed">
              あなたの言葉が魔力となり、<br/>唯一無二のカードが誕生する。
            </p>
          </div>
        </Link>

        <Link href="/deck" className="group relative p-8 rounded-2xl bg-slate-950/60 border border-blue-500/20 hover:border-blue-500 transition-all hover:bg-slate-900/80 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="p-5 rounded-full bg-slate-950 border border-blue-500/30 group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500">
              <Layers className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#f0e6d2] group-hover:text-blue-400 transition-colors">デッキ編成</h2>
            <p className="text-[#d8c8a8] text-sm leading-relaxed">
              最強の組み合わせを見つけ出し、<br/>無敵の部隊を率いよ。
            </p>
          </div>
        </Link>

        <Link href="/battle" className="group relative p-8 rounded-2xl bg-slate-950/60 border border-red-500/20 hover:border-red-500 transition-all hover:bg-slate-900/80 hover:-translate-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="p-5 rounded-full bg-slate-950 border border-red-500/30 group-hover:border-red-500 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-500">
              <Swords className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#f0e6d2] group-hover:text-red-400 transition-colors">バトル</h2>
            <p className="text-[#d8c8a8] text-sm leading-relaxed">
              戦場が君を待っている。<br/>栄光を掴み取れ。
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
