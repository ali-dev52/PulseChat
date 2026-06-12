import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const SplashScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState("loading");

  useEffect(() => {
    // 1.5 seconds of complex pattern, then 0.5s of blast/exit
    const timer = setTimeout(() => {
      setPhase("exit");
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "complete" && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.2 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-slate-950"
        >
          {phase === "loading" && (
            <div className="relative flex items-center justify-center">
              {/* Spinning geometric rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  initial={{ scale: 0, rotate: 0, borderRadius: "20%" }}
                  animate={{
                    scale: [0, 1.5, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "30%"],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute w-24 h-24 border-4 border-primary-500/50 mix-blend-multiply dark:mix-blend-screen shadow-[0_0_30px_rgba(var(--primary-500),0.3)]"
                  style={{ transformOrigin: "center center" }}
                />
              ))}

              {/* Pulsing Core */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 0.8], opacity: [0, 1, 0.8] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="absolute w-12 h-12 bg-primary-600 rounded-full shadow-[0_0_40px_rgba(var(--primary-600),1)]"
              />

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute mt-48 text-primary-600 dark:text-primary-400 font-bold tracking-[0.3em] uppercase text-sm"
              >
                Initializing
              </motion.div>
            </div>
          )}

          {phase === "exit" && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: [1, 20], opacity: [1, 0] }}
              transition={{ duration: 0.8, ease: "easeIn" }}
              className="absolute w-32 h-32 bg-primary-500 rounded-full blur-xl"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
