import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

const OTPInput = ({ length = 6, onChange, isLoading }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(null);
  const inputs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    onChange(newOtp.join(""));

    if (element.value !== "" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        onChange(newOtp.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    onChange(newOtp.join(""));

    const nextIndex = Math.min(pasteData.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-4 sm:gap-6 justify-center">
      {otp.map((data, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.5 }}
          className="relative group"
        >
          <input
            type="text"
            name="otp"
            maxLength="1"
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            ref={(ref) => (inputs.current[index] = ref)}
            disabled={isLoading}
            className={cn(
              "w-12 h-16 sm:w-16 sm:h-20 text-center text-2xl font-heading font-extrabold uppercase bg-elevated border-2 border-border rounded-md text-text outline-none transition-all duration-300",
              "focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-text-muted/50",
              "disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
            )}
            style={{ fontFamily: "'Fira Code', monospace" }}
          />
          <AnimatePresence>
            {focusedIndex === index && (
              <motion.div
                layoutId="otp-glow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -inset-1 bg-primary/20 blur-md rounded-lg -z-10"
              />
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default OTPInput;
