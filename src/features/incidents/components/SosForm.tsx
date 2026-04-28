"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Flame,
  HeartPulse,
  ShieldAlert,
  Siren,
  ArrowRight,
  ChevronLeft,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { categoryCopy } from "../constants";
import type { IncidentCategory, IncidentRecord } from "../types";

const categories = [
  {
    value: "Medical" as const,
    icon: HeartPulse,
    color: "#e11d48",
    description: "Heart attack, injury, or medical emergency.",
  },
  {
    value: "Fire" as const,
    icon: Flame,
    color: "#f97316",
    description: "Smoke, fire, or gas leak detected.",
  },
  {
    value: "Security" as const,
    icon: ShieldAlert,
    color: "#0ea5e9",
    description: "Intruder, theft, or safety concern.",
  },
];

export function SosForm() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportedIncident, setReportedIncident] = useState<IncidentRecord | null>(null);

  /**
   * Smart location formatter:
   * 1. Capitalizes the first letter of every word
   * 2. Auto-inserts a space when letters transition to digits (e.g. "room556" → "Room 556")
   */
  function formatLocationInput(raw: string): string {
    // Step 1: Insert space at every letter→digit boundary (e.g. "room556" → "room 556")
    let formatted = raw.replace(/([a-zA-Z])(\d)/g, "$1 $2");

    // Step 2: Insert space at every digit→letter boundary (e.g. "2room" → "2 room")
    formatted = formatted.replace(/(\d)([a-zA-Z])/g, "$1 $2");

    // Step 3: Capitalize the first letter of every word
    formatted = formatted.replace(/\b([a-zA-Z])/g, (match) => match.toUpperCase());

    return formatted;
  }

  function handleRoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const rawValue = input.value;
    const cursorPos = input.selectionStart ?? rawValue.length;

    const formatted = formatLocationInput(rawValue);

    // Adjust cursor: formatting may have added extra characters (spaces)
    const lengthDiff = formatted.length - rawValue.length;
    const newCursorPos = cursorPos + lengthDiff;

    setRoomNumber(formatted);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      input.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  // Auto-focus room input on step 2
  useEffect(() => {
    if (step === 2) {
      const input = document.getElementById("room-input");
      if (input) input.focus();
    }
  }, [step]);

  async function handleSubmit() {
    if (!selectedCategory || !roomNumber.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          roomNumber,
          guestPhone,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Dispatch failed. Please try again or call front desk.");
      }

      const incident = await response.json();
      setReportedIncident(incident);
      setStep(4);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Dispatch failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (reportedIncident) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 border-2 border-emerald-500/50"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Help is on the way</h1>
        <p className="text-xl text-white/70 mb-12 max-w-md">
          Emergency personnel have been dispatched to <strong>{reportedIncident.roomNumber}</strong>. 
          Stay calm and stay where you are.
        </p>
        <div className="w-full max-w-sm space-y-4">
          <div className="glass-card p-6 rounded-3xl text-left border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-2">
              <Siren className="w-5 h-5 text-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-500">Status: Dispatched</span>
            </div>
            <p className="text-sm text-white/60">Estimated arrival: 2-4 minutes</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all"
          >
            Update Incident Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center py-12 px-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                What is the <span className="text-gradient">Emergency?</span>
              </h1>
              <p className="text-white/60 text-lg">Choose a category to alert the response team.</p>
            </div>

            <div className="grid gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    nextStep();
                  }}
                  className="group relative flex items-center gap-6 p-6 md:p-8 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-left overflow-hidden shadow-2xl"
                >
                  {/* Subtle background glow */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ backgroundColor: cat.color }}
                  />
                  
                  <div 
                    className="relative w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${cat.color}60, ${cat.color}20)`,
                      border: `1px solid ${cat.color}`
                    }}
                  >
                    <cat.icon className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] text-white" />
                  </div>
                  <div className="relative flex-1">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight group-hover:translate-x-1 transition-transform">{cat.value}</h3>
                    <p className="text-white/60 text-sm md:text-base leading-tight font-medium">{cat.description}</p>
                  </div>
                  <ArrowRight className="relative w-6 h-6 text-white/20 group-hover:text-white transition-all group-hover:translate-x-2" />
                </button>
              ))}
            </div>


          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <button onClick={prevStep} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Where are you?</h2>
              <p className="text-white/60">Enter your room number or current location.</p>
            </div>

            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-accent" />
              <input
                id="room-input"
                type="text"
                value={roomNumber}
                onChange={handleRoomChange}
                placeholder="Room 304, Lobby, Pool..."
                className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] py-6 pl-16 pr-6 text-2xl text-white outline-none focus:border-accent transition-all placeholder:text-white/20"
              />
            </div>

            <button
              onClick={nextStep}
              disabled={!roomNumber.trim()}
              className="w-full py-6 rounded-[28px] bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xl font-black shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              Next Step
              <ArrowRight className="w-6 h-6" />
            </button>

          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <button onClick={prevStep} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Final Details</h2>
              <p className="text-white/60">Almost there. Provide optional info to help responders.</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Phone className="absolute left-6 top-6 w-5 h-5 text-white/30" />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Your Phone (Optional)"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-lg text-white outline-none focus:border-accent transition-all placeholder:text-white/20"
                />
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-6 top-6 w-5 h-5 text-white/30" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the situation (Optional)"
                  rows={4}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-[24px] py-5 pl-14 pr-6 text-lg text-white outline-none focus:border-accent transition-all placeholder:text-white/20 resize-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                <AlertTriangle className="w-5 h-5" />
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group w-full py-6 rounded-[28px] bg-gradient-to-r from-red-600 to-rose-500 text-white text-xl font-black shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Siren className="w-6 h-6 animate-spin" />
                  <span className="uppercase tracking-widest">Dispatching...</span>
                </>
              ) : (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <Siren className="w-7 h-7 animate-pulse" />
                  <span className="uppercase tracking-[0.1em]">Trigger SOS</span>
                </>
              )}
            </button>

          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Step Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? "w-8 bg-accent" : "w-2 bg-white/20"}`} 
          />
        ))}
      </div>
    </div>
  );
}

