import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Music2 } from "lucide-react";
import { useEffect, useState, type DragEvent } from "react";

const INTRO_SEEN = "jj_orchestra_intro_seen";

export function OrchestraIntro() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState("/intro-image/orchestra_stage.jpg");

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(INTRO_SEEN)) return;
      window.sessionStorage.setItem(INTRO_SEEN, "1");
    } catch {
      /* session storage is optional */
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), reduceMotion ? 350 : 2000);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file?.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(file));
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden bg-background"
          onDragOver={(event) => event.preventDefault()}
          onDrop={drop}
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 1, 0] }}
          transition={{ duration: reduceMotion ? 0.35 : 2, times: [0, 0.575, 0.825, 1], ease: "easeInOut" }}
          exit={{ opacity: 0 }}
          aria-label="BOH Japanreise Orchester-Vorspann"
        >
          <motion.img
            src={image}
            alt="BOH-Orchester auf der Bühne"
            className="h-full w-full object-cover"
            initial={{ scale: 1.08, x: "-2%" }}
            animate={reduceMotion ? {} : { scale: [1.08, 1.22, 1.22, 1.16], x: ["-2%", "2%", "2%", "0%"] }}
            transition={{ duration: 2, times: [0, 0.4, 0.575, 1], ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-background/30" />
          {!reduceMotion && (
            <motion.div
              className="absolute inset-0 border-[10px] border-primary/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0, 0] }}
              transition={{ duration: 2, times: [0, 0.16, 0.4, 1] }}
            />
          )}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: reduceMotion ? 1 : [0, 0, 1, 1, 0], scale: reduceMotion ? 1 : [0.4, 0.4, 1.18, 1, 1.08] }}
            transition={{ duration: reduceMotion ? 0.3 : 2, times: [0, 0.575, 0.64, 0.825, 1], ease: "easeOut" }}
          >
            <motion.div
              className="absolute size-40 rounded-full border-4 border-primary"
              animate={reduceMotion ? {} : { scale: [0, 0, 3.5], opacity: [0, 0.9, 0] }}
              transition={{ duration: 2, times: [0, 0.575, 0.825] }}
            />
            <Music2 className="mb-3 size-9 text-primary" />
            <p className="font-display text-7xl font-bold text-primary drop-shadow-lg">こんにちは!</p>
            <p className="mt-2 text-sm font-bold tracking-[0.3em] text-foreground uppercase">BOH Japanreise</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}