import { Card as CardType } from "@/lib/game-logic";
import { cn } from "@/lib/utils";
import { Sword, Heart, Flame, Droplets, Leaf, Sun, Skull } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface CardProps {
  card: CardType;
  className?: string;
  onClick?: () => void;
  isEnemy?: boolean;
}

const ElementIcons = {
  Fire: Flame,
  Water: Droplets,
  Nature: Leaf,
  Light: Sun,
  Dark: Skull,
};

const ElementStyles = {
  Fire: {
    border: "border-red-600",
    bg: "bg-gradient-to-br from-red-950 to-slate-900",
    text: "text-red-400",
    shadow: "shadow-red-900/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]",
  },
  Water: {
    border: "border-blue-600",
    bg: "bg-gradient-to-br from-blue-950 to-slate-900",
    text: "text-blue-400",
    shadow: "shadow-blue-900/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]",
  },
  Nature: {
    border: "border-green-600",
    bg: "bg-gradient-to-br from-green-950 to-slate-900",
    text: "text-green-400",
    shadow: "shadow-green-900/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]",
  },
  Light: {
    border: "border-yellow-500",
    bg: "bg-gradient-to-br from-yellow-950 to-slate-900",
    text: "text-yellow-400",
    shadow: "shadow-yellow-900/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]",
  },
  Dark: {
    border: "border-purple-600",
    bg: "bg-gradient-to-br from-purple-950 to-slate-900",
    text: "text-purple-400",
    shadow: "shadow-purple-900/40",
    glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]",
  },
};

export function Card({ card, className, onClick, isEnemy }: CardProps) {
  // Fallback to Nature if element is invalid to prevent crash
  const Icon = ElementIcons[card.element as keyof typeof ElementIcons] || ElementIcons.Nature;
  const style = ElementStyles[card.element as keyof typeof ElementStyles] || ElementStyles.Nature;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      whileHover={!isEnemy ? { scale: 1.05, y: -10, zIndex: 10 } : {}}
      onClick={onClick}
      className={cn(
        "relative w-64 h-96 rounded-xl overflow-hidden border-[6px] transition-shadow duration-300 group cursor-pointer flex flex-col select-none",
        style.border,
        style.bg,
        style.shadow,
        !isEnemy && style.glow,
        "shadow-2xl",
        className
      )}
    >
      {/* Decorative Border Frame */}
      <div className="absolute inset-0 border-2 border-[#c5a000]/30 rounded-lg pointer-events-none z-20" />
      <div className="absolute inset-1 border border-[#c5a000]/10 rounded pointer-events-none z-20" />

      {/* Header */}
      <div className="p-3 flex justify-between items-start relative z-10">
        <div className="bg-slate-950 border-2 border-[#c5a000] rounded-full w-10 h-10 flex items-center justify-center font-serif font-bold text-xl text-[#ffd700] shadow-lg relative">
          {card.cost}
          <div className="absolute inset-0 rounded-full border border-[#ffd700]/20 animate-pulse" />
        </div>
        <div className={cn("p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10", style.text)}>
          <Icon size={24} />
        </div>
      </div>

      {/* Image Container */}
      <div className="absolute top-[12%] left-[4%] right-[4%] bottom-[42%] z-0 rounded-lg overflow-hidden border-2 border-slate-800 shadow-inner bg-black">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content Area */}
      <div className="relative z-10 mt-auto bg-slate-900/95 border-t-4 border-[#c5a000] p-3 h-[42%] flex flex-col">
        <div className="absolute -top-5 left-0 right-0 h-6 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
        
        <h3 className="font-serif font-bold text-lg text-[#f0e6d2] text-center mb-1 truncate drop-shadow-md">
          {card.name}
        </h3>
        
        <div className="flex justify-center gap-1 flex-wrap mb-2">
          {(card.keywords || []).map((kw) => (
            <span key={kw} className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm bg-[#c5a000]/20 text-[#ffd700] border border-[#c5a000]/40">
              {kw}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-[#d8c8a8] italic leading-tight text-center px-1 opacity-90 line-clamp-3">
          "{card.explanation}"
        </p>

        {/* Stats Footer */}
        <div className="mt-auto flex justify-between items-center pt-2 px-2">
          <div className="flex items-center gap-1 text-red-400 font-bold text-xl drop-shadow-sm">
            <div className="bg-red-950/80 p-1.5 rounded-md border border-red-800">
              <Sword size={18} />
            </div>
            <span>{card.stats?.attack ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 text-green-400 font-bold text-xl drop-shadow-sm">
            <span>{card.stats?.health ?? 0}</span>
            <div className="bg-green-950/80 p-1.5 rounded-md border border-green-800">
              <Heart size={18} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
