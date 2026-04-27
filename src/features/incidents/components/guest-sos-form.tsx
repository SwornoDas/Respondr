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

import type { IncidentCategory, IncidentRecord } from "../types";

const categories = [
  {
    value: "Medical" as const,
    icon: HeartPulse,
    color: "#ff2d55",
    lightColor: "#fff1f2",
    description: "Medical help needed",
    longDescription: "Heart attack, injury, or medical emergency."
  },
  {
    value: "Fire" as const,
    icon: Flame,
    color: "#ff9500",
    lightColor: "#fff7ed",
    description: "Fire or Smoke",
    longDescription: "Smoke, fire, or gas leak detected."
  },
  {
    value: "Security" as const,
    icon: ShieldAlert,
    color: "#007aff",
    lightColor: "#f0f9ff",
    description: "Security concern",
    longDescription: "Intruder, theft, or safety concern."
  },
];

export function GuestSosForm() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportedIncident, setReportedIncident] = useState<IncidentRecord | null>(null);

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
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
        >
          <CheckCircle2 className="w-16 h-16 text-white" />
        </motion.div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Assistance Dispatched</h1>
        <p className="text-2xl text-white/70 mb-12 max-w-lg font-medium">
          The team is heading to <span className="text-white bg-white/20 px-3 py-1 rounded-xl">Room {reportedIncident.roomNumber}</span> now.
        </p>
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-8 rounded-[40px] text-center">
            <Siren className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-bold text-white">Estimated Arrival: 2-4 mins</p>
            <p className="text-white/60 mt-1">Stay where you are.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-6 rounded-[32px] bg-white text-ink-strong font-black text-xl hover:bg-white/90 active:scale-95 transition-all shadow-xl"
          >
            Update Details
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-10"
          >
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter">
                EMERGENCY <br />
                <span className="text-gradient">REPORT</span>
              </h1>
              <p className="text-white/60 text-xl font-medium uppercase tracking-widest">Select One Below</p>
            </div>

            <div className="grid gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    nextStep();
                  }}
                  className="group relative flex items-center justify-between p-8 rounded-[40px] border-4 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 text-left overflow-hidden shadow-2xl"
                >
                  {/* Dramatic Glow on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
                    style={{ background: cat.color }}
                  />
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-[32px] flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                      style={{ backgroundColor: cat.color }}
                    >
                      <cat.icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black text-white mb-1 uppercase tracking-tight">{cat.value}</h3>
                      <p className="text-white/60 text-lg font-medium">{cat.description}</p>
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all relative z-10 border border-white/10">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-10"
          >
            <button onClick={prevStep} className="flex items-center gap-3 text-white/50 hover:text-white font-bold text-lg uppercase tracking-widest transition-colors">
              <ChevronLeft className="w-6 h-6" /> Back
            </button>
            
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">Your <br />Location</h2>
              <p className="text-white/60 text-xl font-medium">Where do you need assistance?</p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-blue-500 rounded-[40px] blur opacity-20 group-focus-within:opacity-100 transition duration-500 animate-pulse"></div>
              <div className="relative">
                <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-accent" />
                <input
                  id="room-input"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 304 or Lobby"
                  className="w-full bg-black/40 border-4 border-white/10 rounded-[40px] py-10 pl-20 pr-8 text-4xl font-black text-white outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <button
              onClick={nextStep}
              disabled={!roomNumber.trim()}
              className="group w-full py-10 rounded-[40px] bg-white text-black text-3xl font-black uppercase tracking-tighter shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-white/90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
            >
              Confirm Location
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="space-y-10"
          >
            <button onClick={prevStep} className="flex items-center gap-3 text-white/50 hover:text-white font-bold text-lg uppercase tracking-widest transition-colors">
              <ChevronLeft className="w-6 h-6" /> Back
            </button>
            
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">Ready to <br />Dispatch?</h2>
              <p className="text-white/60 text-xl font-medium">Add details or send immediately.</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Phone className="absolute left-8 top-8 w-6 h-6 text-white/30" />
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Your Phone (Optional)"
                  className="w-full bg-white/5 border-4 border-white/10 rounded-[32px] py-8 pl-16 pr-8 text-2xl font-bold text-white outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                />
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-8 top-8 w-6 h-6 text-white/30" />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description (Optional)"
                  rows={3}
                  className="w-full bg-white/5 border-4 border-white/10 rounded-[32px] py-8 pl-16 pr-8 text-2xl font-bold text-white outline-none focus:border-white/30 transition-all placeholder:text-white/10 resize-none"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-4 p-6 rounded-[32px] bg-red-500/20 border-2 border-red-500/30 text-red-500 font-bold">
                <AlertTriangle className="w-6 h-6" />
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group relative w-full py-12 rounded-[50px] bg-[#ff2d55] text-white text-4xl font-black uppercase tracking-tighter shadow-[0_30px_60px_rgba(255,45,85,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 overflow-hidden"
            >
              {/* Massive Glow Expansion */}
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 transition-transform duration-700 rounded-full blur-3xl opacity-0 group-hover:opacity-100" />
              
              <div className="flex items-center justify-center gap-6 relative z-10">
                {isSubmitting ? (
                  <>
                    <Siren className="w-12 h-12 animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>
                    <Siren className="w-12 h-12 group-hover:animate-bounce" />
                    DISPATCH NOW
                  </>
                )}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 flex">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`flex-1 transition-all duration-700 ${step >= i ? "bg-accent" : "bg-white/10"}`} 
          />
        ))}
      </div>
    </div>
  );
}


