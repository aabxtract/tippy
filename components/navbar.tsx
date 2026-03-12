"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStacks } from "@/hooks/use-stacks";
import { Wallet, Send, Layers, Heart, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { userData, balance, connectWallet, disconnectWallet, stxAddress } = useStacks();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Send", href: "/", icon: Send },
    { name: "Bulk Send", href: "/bulk", icon: Layers },
    { name: "Tip Me", href: "/tip", icon: Heart },
  ];

  const truncateAddress = (addr: string) => 
    `${addr.slice(0, 5)}...${addr.slice(-5)}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between glass-card px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:block">STX Pay</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-2xl p-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium",
                pathname === item.href 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {userData ? (
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs text-white/50 font-medium">Balance</span>
                <span className="text-sm font-bold">{parseFloat(balance).toFixed(2)} STX</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10 hidden lg:block" />
              <button 
                onClick={disconnectWallet}
                className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 px-4 py-2 rounded-xl transition-all group"
              >
                <span className="text-sm font-medium hidden sm:block">
                  {truncateAddress(stxAddress)}
                </span>
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              className="btn-primary py-2 px-5 text-sm"
            >
              Connect Wallet
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white/60"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 glass-card p-4 flex flex-col gap-2"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  pathname === item.href 
                    ? "bg-[var(--primary)] text-white" 
                    : "text-white/60 hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
