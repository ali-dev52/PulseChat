import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const DOTS = [
  { x: "-50vw", y: "-50vh" },
  { x: "50vw", y: "-50vh" },
  { x: "-50vw", y: "50vh" },
  { x: "50vw", y: "50vh" },
  { x: 0, y: "-50vh" },
  { x: 0, y: "50vh" },
  { x: "-50vw", y: 0 },
  { x: "50vw", y: 0 },
];

const AnimatedReveal = ({ children, animationKey }) => {
  const [phase, setPhase] = useState("entering");

  useEffect(() => {
    setPhase("entering");
    const timer = setTimeout(() => {
      setPhase("revealed");
    }, 1200);
    return () => clearTimeout(timer);
  }, [animationKey]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === "entering" ? (
          <motion.div
            key={`dots-${animationKey}`}
            className="absolute z-50 w-full h-full flex items-center justify-center pointer-events-none"
            exit={{ scale: 0, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.4 }}
          >
            {DOTS.map((dot, i) => (
              <motion.div
                key={i}
                initial={{ x: dot.x, y: dot.y, scale: 0, opacity: 0 }}
                animate={{ x: 0, y: 0, scale: [0, 1.5, 0.5], opacity: [0, 1, 0.5] }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  type: "spring",
                  damping: 15,
                  stiffness: 100,
                }}
                className="absolute w-4 h-4 rounded-full bg-primary-500 shadow-[0_0_30px_rgba(var(--primary-500),1)]"
              />
            ))}

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 3, 5, 0], 
                opacity: [0, 1, 1, 0],
                rotate: [0, 90, 180] 
              }}
              transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
              className="absolute w-16 h-16 rounded-full bg-primary-400 blur-2xl"
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
              transition={{ delay: 0.9, duration: 0.3 }}
              className="absolute w-8 h-8 rounded-full bg-white shadow-[0_0_50px_rgba(255,255,255,1)]"
            />
          </motion.div>
        ) : (
          <motion.div
            key={`content-${animationKey}`}
            initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              mass: 0.8
            }}
            className="w-full h-full relative"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedReveal;
