import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, BookOpen, MapPin, Clock, User, Calendar } from "lucide-react";
import { StudyGroup } from "../types";

interface HostGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHost: (group: any) => void;
}

const SUBJECTS = [
  "Mathematics", "Computer Science", "Biology", "Chemistry", 
  "Physics", "History", "Literature", "Economics", 
  "Psychology", "Art History"
];

export default function HostGroupModal({ isOpen, onClose, onHost }: HostGroupModalProps) {
  // 1. Pre-fill hostName from localStorage safely
  const [hostName, setHostName] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.firstName ? `${userData.firstName} ${userData.lastName}` : "";
  });

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Format the time string to match your MongoDB "Session" model
    const formattedTime = `${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startTime} - ${endTime}`;

    const payload = {
      subject,
      location,
      time: formattedTime,
      hostName,
      userId: userData.id // Required by your backend sessions.js
    };

    try {
      await onHost(payload); 
      onClose();
      // Reset form
      setLocation("");
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#fdfcf8] rounded-3xl shadow-2xl z-[60] overflow-hidden border border-[#e5e5e0]"
          >
            <div className="p-6 border-b border-[#e5e5e0] flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold text-[#1a1a1a] font-serif">Host a Study Group</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-2 tracking-widest">Subject</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none appearance-none text-sm"
                    >
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-2 tracking-widest">Host Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text" required value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-2 tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text" required placeholder="e.g. Library Room 201" value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-2 tracking-widest">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date" required value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-2 tracking-widest">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="time" required value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase mb-2 tracking-widest">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="time" required value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#5A5A40] text-white font-bold rounded-full shadow-lg hover:bg-[#4a4a34] transition-all transform active:scale-95"
              >
                Create Study Group
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}