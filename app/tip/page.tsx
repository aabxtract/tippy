"use client";

import { useStacks } from "@/hooks/use-stacks";
import { Heart, Copy, Check, Share2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TipSetupPage() {
  const { userData, stxAddress, connectWallet } = useStacks();
  const [copied, setCopied] = useState(false);

  const tipLink = typeof window !== "undefined" 
    ? `${window.location.origin}/tip/${stxAddress}` 
    : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tipLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 pt-12">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
          <Heart className="w-10 h-10 text-white/20" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Get Your Tip Link</h1>
          <p className="text-white/50 max-w-sm mx-auto">
            Connect your wallet to generate a unique link and start receiving tips in STX.
          </p>
        </div>
        <button onClick={connectWallet} className="btn-primary">
          Connect Wallet to Start
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Your Tip Link</h1>
        <p className="text-white/50">Share this link with your audience to receive STX</p>
      </div>

      <div className="glass-card p-8 max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-medium text-white/50 ml-1">Shareable Link</label>
          <div className="flex gap-2">
            <div className="input-field flex-1 flex items-center overflow-hidden">
              <span className="text-white/30 text-sm truncate">{tipLink}</span>
            </div>
            <button
              onClick={copyToClipboard}
              className="btn-secondary aspect-square p-0 w-12 flex items-center justify-center hover:bg-[var(--primary)] hover:border-[var(--primary)] transition-all"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href={`/tip/${stxAddress}`} 
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View My Profile
          </Link>
          <button className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
        </div>

        <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-white/40 uppercase font-bold">Address</p>
            <p className="text-sm font-medium truncate">{stxAddress}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs text-white/40 uppercase font-bold">Status</p>
            <p className="text-sm font-medium text-emerald-400">Active</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-6 space-y-3"
        >
          <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center">
            <Share2 className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h3 className="font-bold">Social Sharing</h3>
          <p className="text-xs text-white/50">Add your tip link to your X (Twitter), Bio or website.</p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-6 space-y-3"
        >
          <div className="w-10 h-10 bg-[var(--accent)]/20 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <h3 className="font-bold">No Platform Fee</h3>
          <p className="text-xs text-white/50">Every STX sent goes directly to your wallet.</p>
        </motion.div>
      </div>
    </div>
  );
}
