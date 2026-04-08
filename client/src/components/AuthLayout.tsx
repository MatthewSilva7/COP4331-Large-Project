import React from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fdfcf8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-serif">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <div className="bg-[#5A5A40] p-3 rounded-2xl shadow-lg">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-[#1a1a1a]">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-[#5A5A40] italic">
          {subtitle}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl border border-[#e5e5e0] sm:rounded-3xl sm:px-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
