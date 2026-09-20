import React, { useState, useEffect } from "react";
import { Music, Sparkles } from "lucide-react";

interface OrchestraIntroProps {
  onFinish?: () => void;
}

export const OrchestraIntro: React.FC<OrchestraIntroProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 2-second timer for orchestra intro splash
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1800);

    const finishTimer = setTimeout(() => {
      setVisible(false);
      onFinish?.();
    }, 2200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center max-w-md px-6 text-center">
        {/* Japanese Torii & Cherry Blossom Style Emblem */}
        <div className="w-20 h-20 rounded-full bg-rose-950/80 border border-rose-500/30 flex items-center justify-center mb-6 shadow-2xl shadow-rose-900/40 animate-pulse">
          <Music className="w-10 h-10 text-rose-400" />
        </div>

        <div className="text-xs uppercase tracking-[0.3em] text-rose-400 font-semibold mb-2">
          Orchester-Tournee 2026
        </div>

        <h1 className="text-3xl font-bold font-jp tracking-wide text-white mb-2">日本演奏旅行</h1>

        <p className="text-sm text-slate-300 tracking-wider font-medium">
          Tokyo &middot; Kyoto &middot; Osaka
        </p>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Reise- & Probenbegleiter wird geladen...</span>
        </div>

        <button
          onClick={() => {
            setFading(true);
            setTimeout(() => setVisible(false), 300);
          }}
          className="mt-6 text-[11px] text-slate-400 underline underline-offset-4 hover:text-white transition-colors"
        >
          Überspringen
        </button>
      </div>
    </div>
  );
};
