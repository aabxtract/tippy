"use client";

import { use, useState, useEffect } from "react";
import { useStacks } from "@/hooks/use-stacks";
// import { request } from "@stacks/connect"; // Use dynamic import for client-side only
import { STACKS_MAINNET } from "@stacks/network";
import { Heart, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TipProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { userData, connectWallet } = useStacks();
  const [tipAmount, setTipAmount] = useState("5");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [totalTips, setTotalTips] = useState<string>("0");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const amounts = ["1", "5", "10", "25", "50"];

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${address}/balances`);
        const data = await response.json();
        // Just as an example, using total received as a proxy
        // Real app would filter for specific "tip" transactions
        const totalReceived = (parseInt(data.stx.total_sent) + parseInt(data.stx.balance)) / 1000000;
        setTotalTips(totalReceived.toFixed(2));
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [address]);

  const handleTip = async () => {
    if (!userData) {
      connectWallet();
      return;
    }

    setStatus("pending");
    try {
      const { request } = await import("@stacks/connect");
      const response = await request("stx_transferStx", {
        recipient: address,
        amount: (parseFloat(tipAmount) * 1000000).toString(),
        memo: "Tip via Tippy",
      });

      if (response.txid) {
        setStatus("success");
      } else {
        setStatus("idle");
      }
    } catch (error) {
      setStatus("failed");
    }
  };

  const truncateAddress = (addr: string) => 
    `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="glass-card overflow-hidden">
        {/* Header/Cover */}
        <div className="h-32 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] opacity-40" />
        
        <div className="p-8 pt-0 -mt-12 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 bg-[var(--background)] border-4 border-[var(--background)] rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10" />
            <User className="w-12 h-12 text-white/20" />
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-1 right-1"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
            </motion.div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{truncateAddress(address)}</h1>
            <div className="flex items-center gap-1.5 text-white/50 text-sm justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Verified STX Recipient
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full py-6 border-y border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Lifetime Volume</p>
              <p className="text-xl font-bold">{loadingProfile ? "---" : `${totalTips} STX`}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Network</p>
              <p className="text-xl font-bold text-[var(--primary)]">Mainnet</p>
            </div>
          </div>

          <div className="w-full space-y-6 pt-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/60">Select Tip Amount</p>
              <div className="grid grid-cols-5 gap-2">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTipAmount(amt)}
                    className={cn(
                      "py-3 rounded-xl text-sm font-bold border transition-all",
                      tipAmount === amt 
                        ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg shadow-primary/20" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Custom amount"
                className="input-field w-full text-center py-4 text-xl font-bold"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 font-bold">STX</span>
            </div>

            <button
              onClick={handleTip}
              disabled={status === "pending"}
              className="btn-primary w-full py-5 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-primary/40"
            >
              <Heart className={cn("w-6 h-6", tipAmount && "fill-white")} />
              {status === "pending" ? "Confirming..." : `Send ${tipAmount} STX Tip`}
            </button>

            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-emerald-400 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-bold">Tip Sent Successfully!</p>
                    <p className="text-xs opacity-80">Thank you for supporting this creator.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="text-center text-white/30 text-xs">
        Securely powered by <span className="font-bold text-white/40">STX Pay</span>
      </div>
    </div>
  );
}
