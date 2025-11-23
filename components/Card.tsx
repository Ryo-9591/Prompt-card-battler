import { Card as CardType } from "@/lib/game-logic";
import { cn } from "@/lib/utils";
import { Sword, Heart, Zap, Shield, Skull, Droplets, Flame, Leaf, Sun } from "lucide-react";
import Image from "next/image";

interface CardProps {
  card: CardType;
  className?: string;
  onClick?: () => void;
}

const ElementIcons = {
  Fire: Flame,
  Water: Droplets,
  Nature: Leaf,
  Light: Sun,
  Dark: Skull,
};

const ElementColors = {
  Fire: "border-magic-fire bg-slate-900/90 shadow-magic-fire/20",
  Water: "border-magic-water bg-slate-900/90 shadow-magic-water/20",
  Nature: "border-magic-nature bg-slate-900/90 shadow-magic-nature/20",
  Light: "border-magic-light bg-slate-900/90 shadow-magic-light/20",
  Dark: "border-magic-dark bg-slate-900/90 shadow-magic-dark/20",
};

const ElementTextColors = {
  Fire: "text-magic-fire",
  Water: "text-magic-water",
  Nature: "text-magic-nature",
  Light: "text-magic-light",
  Dark: "text-magic-dark",
};

export function Card({ card, className, onClick }: CardProps) {
  const Icon = ElementIcons[card.element];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-64 h-96 rounded-xl shadow-2xl overflow-hidden border-4 transition-transform hover:scale-105 group cursor-pointer flex flex-col",
        ElementColors[card.element],
        className
      )}
    >
      {/* Header */}
      <div className="p-3 flex justify-between items-start relative z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="bg-slate-950/80 rounded-full w-8 h-8 flex items-center justify-center border border-slate-700 font-serif font-bold text-lg text-white shadow-lg">
          {card.cost}
        </div>
        <div className={cn("p-1 rounded-full bg-slate-950/50 backdrop-blur-md", ElementTextColors[card.element])}>
          <Icon size={20} />
        </div>
      </div>

      {/* Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mt-auto p-4 space-y-2">
        <h3 className="font-serif font-bold text-xl text-white drop-shadow-md leading-tight">
          {card.name}
        </h3>
        
        <div className="flex gap-1 flex-wrap">
          {(card.keywords || []).map((kw) => (
            <span key={kw} className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/20">
              {kw}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-300 italic line-clamp-2 border-l-2 border-slate-600 pl-2">
          "{card.explanation}"
        </p>

        {/* Stats */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <div className="flex items-center gap-1 text-red-400 font-bold text-lg bg-black/40 px-2 py-0.5 rounded-lg border border-red-900/50">
            <Sword size={16} />
            <span>{card.stats?.attack ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 text-green-400 font-bold text-lg bg-black/40 px-2 py-0.5 rounded-lg border border-green-900/50">
            <Heart size={16} />
            <span>{card.stats?.health ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
