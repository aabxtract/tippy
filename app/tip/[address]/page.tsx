"use client";

import { use, useState, useEffect } from "react";
import { useStacks } from "@/hooks/use-stacks";
import { STACKS_MAINNET } from "@stacks/network";
import { Heart, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, User, ShieldCheck, Coffee, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CONTRACT_ADDRESS, CONTRACT_NAME } from "@/lib/stacks";

export default function TipProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { userData, connectWallet } = useStacks();
  
  // Tipping states
  const [tipAmount, setTipAmount] = useState("5");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  
  // Profile states
  const [profile, setProfile] = useState<{ name: string; bio: string; price: string } | null>(null);
  const [stats, setStats] = useState<{ total: string; count: string }>({ total: "0", count: "0" });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const amounts = ["1", "5", "10", "25", "50"];

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { fetchCallReadOnlyFunction, cvToJSON, principalCV } = await import("@stacks/transactions");
        const { STACKS_MAINNET } = await import("@stacks/network");
        
        // Fetch Profile
        const profileResult = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: "get-profile",
          functionArgs: [principalCV(address)],
          network: STACKS_MAINNET,
          senderAddress: address,
        });

        const profileJson = cvToJSON(profileResult) as any;
        if (profileJson && profileJson.value) {
          setProfile({
            name: profileJson.value.name.value,
            bio: profileJson.value.bio.value,
            price: (parseInt(profileJson.value.price.value) / 1000000).toString(),
          });
          setTipAmount((parseInt(profileJson.value.price.value) / 1000000).toString());
        }

        // Fetch Stats
        const statsResult = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: "get-stats",
          functionArgs: [principalCV(address)],
          network: STACKS_MAINNET,
          senderAddress: address,
        });

        const statsJson = cvToJSON(statsResult) as any;
        if (statsJson && statsJson.value) {
          setStats({
            total: (parseInt(statsJson.value["total-received"].value) / 1000000).toFixed(2),
            count: statsJson.value["total-tips"].value,
          });
        }

      } catch (error) {
        console.error("Error fetching profile from contract:", error);
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
      const { request } = (await import("@stacks/connect")) as any;
      const { stringAsciiCV, uintCV, principalCV } = await import("@stacks/transactions");
      
      const response = await request("stx_callContract", {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "tip",
        functionArgs: [
          principalCV(address),
          uintCV(parseFloat(tipAmount) * 1000000),
          stringAsciiCV(message || "Buying you a coffee! ☕")
        ],
      });

      if (response && (response as any).txid) {
        console.log("Tip sent:", response);
        setStatus("success");
        setMessage("");
      }
    } catch (error) {
      console.error("Tip failed:", error);
      setStatus("failed");
    }
  };

  const truncateAddress = (addr: string) => 
    `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      <div className="glass-card overflow-hidden">
        {/* Header/Cover */}
        <div className="h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] relative">
            <div className="absolute inset-0 backdrop-blur-3xl opacity-30" />
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-4 right-4"
            >
              <Sparkles className="w-8 h-8 text-white/40" />
            </motion.div>
        </div>
        
        <div className="p-8 pt-0 -mt-16 flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 bg-[var(--background)] border-[6px] border-[var(--background)] rounded-[2.5rem] shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/10">
              <User className="w-16 h-16 text-[var(--primary)]" />
            </div>
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-2 right-2"
            >
              <ShieldCheck className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
            </motion.div>
          </div>

          <div className="space-y-2 w-full">
            <h1 className="text-3xl font-black tracking-tight">
              {loadingProfile ? "Loading..." : (profile?.name || truncateAddress(address))}
            </h1>
            <p className="text-white/60 text-sm max-w-sm mx-auto line-clamp-2 italic">
               {loadingProfile ? "Fetching profile bio..." : (profile?.bio || "Support my work with a quick STX tip! 🥤")}
            </p>
            <div className="flex items-center gap-1.5 text-white/40 text-[10px] uppercase font-bold justify-center tracking-widest pt-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Verified Tippy Creator
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full py-8">
            <div className="space-y-1 glass-card p-4 bg-white/[0.02]">
              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Lifetime Tips</p>
              <p className="text-2xl font-black text-gradient">{stats.total} <span className="text-xs text-white/20">STX</span></p>
              <p className="text-[10px] text-white/40 font-bold">{stats.count} supporters</p>
            </div>
            <div className="space-y-1 glass-card p-4 bg-white/[0.02]">
              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Network</p>
              <p className="text-2xl font-black text-amber-400">Mainnet</p>
              <p className="text-[10px] text-white/40 font-bold">Fast & Secure</p>
            </div>
          </div>

          <div className="w-full space-y-6 pt-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm px-1">
                <p className="font-bold text-white/60">☕ Buy me a coffee</p>
                <div className="h-[1px] flex-1 mx-4 bg-white/5" />
                <p className="font-mono text-[var(--primary)]">{(parseFloat(tipAmount) * 1).toFixed(1)} STX</p>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTipAmount(amt)}
                    className={cn(
                      "py-4 rounded-2xl text-sm font-black transition-all border-2",
                      tipAmount === amt 
                        ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-xl shadow-primary/30" 
                        : "bg-white/5 border-transparent hover:border-white/10 text-white/60"
                    )}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />
                <textarea
                  placeholder="Leave a message (optional)..."
                  className="input-field w-full pl-12 min-h-[100px] py-4 text-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                onClick={handleTip}
                disabled={status === "pending" || !tipAmount}
                className="btn-primary w-full py-6 text-xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Coffee className={cn("w-6 h-6 relative z-10", tipAmount && "fill-white")} />
                <span className="relative z-10">
                  {status === "pending" ? "Ordering..." : `Tip ${tipAmount} STX`}
                </span>
              </button>
            </div>

            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2rem] p-6 text-emerald-400"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="font-black text-xl">Thank You! 🧡</p>
                  </div>
                  <p className="text-sm opacity-80 pl-12">Your support means the world to me. Keep being awesome!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
        Built with <span className="text-red-500/50">❤️</span> using <span className="text-white/40 group-hover:text-white transition-colors cursor-pointer">Tippy</span>
      </div>
    </div>
  );
}
