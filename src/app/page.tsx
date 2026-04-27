"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { AlertCircle, Flame, ShieldAlert, HeartPulse, BellRing } from "lucide-react";

// Types
type IncidentType = "Medical" | "Fire" | "Security" | null;
type Incident = {
  id: string;
  type: string;
  room: string;
  description: string;
  status: string;
  timestamp: string;
};

// Initialize socket outside component to avoid reconnects on re-render
let socket: Socket;

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<IncidentType>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Admin state
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    // Initialize Socket.io
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected to backend via socket");
    });

    // Listen for real-time incidents (Admin functionality)
    socket.on("new_incident", (data: Incident) => {
      console.log("New incident received:", data);
      setIncidents((prev) => [data, ...prev]);
      
      // Bonus: Add sound alert on dashboard
      if (isAdminMode) {
        try {
          const audio = new Audio("/alert-sound.mp3");
          audio.play().catch(e => console.log("Audio play blocked by browser:", e));
        } catch (error) {
          console.error("Audio error:", error);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isAdminMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !roomNumber) return;

    setIsSubmitting(true);

    try {
      // Send API request to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedCategory,
          room: roomNumber,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to report incident");
      }

      setSubmitted(true);
      
      // Note: Backend also emits the socket event after REST API call, 
      // but we could also emit directly via socket as requested:
      // socket.emit("new_incident", { type: selectedCategory, room: roomNumber, description });
      
    } catch (error) {
      console.error("Error reporting incident:", error);
      alert("Failed to report incident. Please try again or call the front desk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "Medical", icon: <HeartPulse className="w-12 h-12 mb-2" />, color: "bg-red-500 hover:bg-red-600" },
    { id: "Fire", icon: <Flame className="w-12 h-12 mb-2" />, color: "bg-orange-500 hover:bg-orange-600" },
    { id: "Security", icon: <ShieldAlert className="w-12 h-12 mb-2" />, color: "bg-blue-500 hover:bg-blue-600" },
  ];

  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BellRing className="text-red-500" />
              CrisisSync Admin Dashboard
            </h1>
            <button 
              onClick={() => setIsAdminMode(false)}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
            >
              Back to Guest View
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No active incidents</p>
              </div>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="bg-slate-800 p-6 rounded-xl border-l-4 border-red-500 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                      {incident.type}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Room {incident.room}</h3>
                  <p className="text-slate-300 mb-4">{incident.description || "No description provided."}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">
                      {incident.status}
                    </span>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                      Acknowledge
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-red-600 text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <AlertCircle className="w-24 h-24 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4">Help is on the way</h1>
        <p className="text-xl mb-8 opacity-90 max-w-md">
          Security and medical teams have been dispatched to Room {roomNumber}. Please stay calm and remain where you are if it is safe to do so.
        </p>
        <button 
          onClick={() => {
            setSubmitted(false);
            setSelectedCategory(null);
            setRoomNumber("");
            setDescription("");
          }}
          className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full font-medium transition backdrop-blur-sm"
        >
          Report another incident
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4">
        <button 
          onClick={() => setIsAdminMode(true)}
          className="text-xs text-slate-400 hover:text-slate-600 transition"
        >
          Admin Login
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-red-600 p-8 text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">SOS Emergency</h1>
          <p className="opacity-90 mt-2">CrisisSync Response System</p>
        </div>

        <div className="p-8">
          {!selectedCategory ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
                What type of emergency?
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as IncidentType)}
                    className={`flex items-center gap-4 p-4 rounded-xl text-white transition-transform active:scale-95 ${cat.color}`}
                  >
                    <div className="bg-white/20 p-3 rounded-lg">
                      {cat.icon}
                    </div>
                    <span className="text-2xl font-bold">{cat.id}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">
                  <span className="text-red-600">{selectedCategory}</span> Emergency
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-800 transition"
                >
                  Change
                </button>
              </div>

              <div>
                <label htmlFor="room" className="block text-sm font-medium text-slate-700 mb-2">
                  Room Number (Required)
                </label>
                <input
                  type="text"
                  id="room"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition text-lg bg-white text-slate-900"
                  placeholder="e.g. 402"
                />
              </div>

              <div>
                <label htmlFor="desc" className="block text-sm font-medium text-slate-700 mb-2">
                  Optional Description
                </label>
                <textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none bg-white text-slate-900"
                  rows={3}
                  placeholder="Any details that might help..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !roomNumber}
                className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white rounded-xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-500/30 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "TRIGGER ALARM"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
