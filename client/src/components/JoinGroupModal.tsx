import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User } from "lucide-react";

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userName: string) => void;
  subject: string;
}

export default function JoinGroupModal({ isOpen, onClose, onConfirm, subject }: JoinGroupModalProps) {
  const [userName, setUserName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      onConfirm(userName);
      setUserName("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#fdfcf8] rounded-3xl shadow-2xl z-[60] overflow-hidden border border-[#e5e5e0]"
          >
            <div className="p-6 border-b border-[#e5e5e0] flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-[#1a1a1a] font-serif">Join {subject}</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <p className="text-sm text-gray-600 italic">
                Please enter your name to join this study session.
              </p>
              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-widest mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#e5e5e0] rounded-xl focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#5A5A40] text-white font-bold rounded-full shadow-lg hover:bg-[#4a4a34] transition-all transform active:scale-[0.98]"
              >
                Confirm Joining
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
