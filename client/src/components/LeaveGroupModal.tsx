import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertCircle } from "lucide-react";

interface LeaveGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subject: string;
}

export default function LeaveGroupModal({ isOpen, onClose, onConfirm, subject }: LeaveGroupModalProps) {
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
              <h2 className="text-xl font-bold text-[#1a1a1a] font-serif">Leave Group</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-2 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Are you sure you want to leave?</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You are currently scheduled for <span className="font-semibold text-gray-700">{subject}</span>.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white border border-[#e5e5e0] text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-all transform active:scale-[0.98]"
                >
                  Yes, Leave
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
