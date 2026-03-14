"use client";

import { useStacks } from "@/hooks/use-stacks";
import { Heart, Copy, Check, Share2, ExternalLink, User, FileText, Coffee, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CONTRACT_ADDRESS, CONTRACT_NAME } from "@/lib/stacks";

export default function TipSetupPage() {
  const { userData, stxAddress, connectWallet } = useStacks();
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile Form States
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("5");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");

  const tipLink = typeof window !== "undefined" 
    ? `${window.location.origin}/tip/${stxAddress}` 
    : "";

  useEffect(() => {
    if (stxAddress) {
      fetchExistingProfile();
    }
  }, [stxAddress]);

  const fetchExistingProfile = async () => {
    try {
      const { callReadOnlyFunction, cvToJSON, principalCV } = await import("@stacks/transactions");
      const { STACKS_MAINNET } = await import("@stacks/network");
      
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-profile",
        functionArgs: [principalCV(stxAddress)],
        network: STACKS_MAINNET,
        senderAddress: stxAddress,
      });

      const json = cvToJSON(result) as any;
      if (json && json.value) {
        setName(json.value.name.value);
        setBio(json.value.bio.value);
        setPrice((parseInt(json.value.price.value) / 1000000).toString());
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userData) return;
    setStatus("pending");
    
    try {
      const { request } = await import("@stacks/connect");
      const { stringAsciiCV, uintCV } = await import("@stacks/transactions");
      
      const response = await request("stx_callContract", {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "set-profile",
        functionArgs: [
          stringAsciiCV(name),
          stringAsciiCV(bio),
          uintCV(parseFloat(price) * 1000000)
        ],
      });

      if (response && (response as any).txid) {
        console.log("Profile updated:", response);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (e) {
      console.error("Error updating profile:", e);
      setStatus("failed");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tipLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 pt-12 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center">
          <Heart className="w-10 h-10 text-white/20" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Get Your Tip Link</h1>
          <p className="text-white/50 max-w-sm mx-auto">
            Connect your wallet to build your profile and start receiving tips in STX.
          </p>
        </div>
        <button onClick={connectWallet} className="btn-primary">
          Connect Wallet to Start
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Creator Dashboard</h1>
        <p className="text-white/50">Manage your profile and share your tipping link</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Profile Settings */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
              <User className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-bold">Profile Info</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Display Name</label>
              <input 
                type="text" 
                placeholder="How fans know you"
                className="input-field w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Bio</label>
              <textarea 
                placeholder="Tell your fans who you are..."
                className="input-field w-full min-h-[100px] py-3 text-sm"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Coffee Price (STX)</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="input-field w-full"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <Coffee className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              </div>
            </div>
          </div>

          <button 
            onClick={handleUpdateProfile}
            disabled={status === "pending" || !name}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 shadow-xl shadow-primary/20"
          >
            {status === "pending" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            Update Profile
          </button>

          <AnimatePresence>
            {status === "success" && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 text-sm text-center font-medium">
                Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Link & Preview */}
        <div className="space-y-6">
          <div className="glass-card p-8 space-y-6 bg-white/[0.02]">
             <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                <Share2 className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h2 className="text-xl font-bold">Share Link</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="input-field flex-1 flex items-center overflow-hidden bg-black/20">
                  <span className="text-white/30 text-xs truncate select-all">{tipLink}</span>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="btn-secondary aspect-square p-0 w-12 flex items-center justify-center hover:bg-[var(--primary)] transition-all"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={`/tip/${stxAddress}`} 
                  target="_blank"
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Profile
                </Link>
                <button className="btn-secondary group flex-1 flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Share Link
                </button>
              </div>
            </div>
          </div>

          {/* Tips Info */}
          <div className="glass-card p-6 bg-gradient-to-br from-[var(--primary)]/10 to-transparent">
             <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Your Stats</p>
                  <h3 className="text-lg font-bold">Lifetime Support</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white">0.00 <span className="text-xs text-white/30 font-bold">STX</span></p>
                  <p className="text-[10px] text-white/40">From 0 tips</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
