import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Generate symmetrical points for dots to fly in from
const DOTS = [
  { x: -1500, y: -1500 },
  { x: 1500, y: -1500 },
  { x: -1500, y: 1500 },
  { x: 1500, y: 1500 },
  { x: 0, y: -1500 },
  { x: 0, y: 1500 },
  { x: -1500, y: 0 },
  { x: 1500, y: 0 },
];

const ModalWrapper = ({ children, onClose }) => {
  const [phase, setPhase] = useState("entering"); // "entering" -> "revealed"

  useEffect(() => {
    // Phase transition after the dots collide
    const timer = setTimeout(() => {
      setPhase("revealed");
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Dynamic Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-md bg-black/50 dark:bg-black/70"
      />

      <AnimatePresence mode="wait">
        {phase === "entering" ? (
          <motion.div
            key="dots-animation"
            className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
            exit={{ scale: 0, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.4 }}
          >
            {/* The flying dots */}
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

            {/* The core that forms when they collide */}
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
            key="modal-content"
            initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)", y: 50 }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ scale: 0.9, opacity: 0, filter: "blur(10px)", y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              mass: 0.8
            }}
            className="relative z-10 w-full md:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModalWrapper;
