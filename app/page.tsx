"use client";

import { useState } from "react";
import { useStacks } from "@/hooks/use-stacks";
// import { request } from "@stacks/connect"; // Use dynamic import for client-side only
import { STACKS_MAINNET } from "@stacks/network";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge } from "@/components/ui/status-badge";

export default function SendPage() {
  const { userData, connectWallet, stxAddress } = useStacks();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [txId, setTxId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSend = async () => {
    if (!userData) {
      connectWallet();
      return;
    }

    if (!recipient || !amount) return;

    setStatus("pending");
    setErrorMessage("");

    try {
      const { request } = await import("@stacks/connect");
      const response = await request("stx_transferStx", {
        recipient,
        amount: (parseFloat(amount) * 1000000).toString(), // convert to microstacks
        memo: "Sent via Tippy",
      });

      if (response.txid) {
        console.log("Transaction finished:", response.txid);
        setTxId(response.txid);
        setStatus("success");
      } else {
        setStatus("idle");
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setStatus("failed");
      setErrorMessage(error.message || "Something went wrong");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Send STX</h1>
        <p className="text-white/50">Transfer STX to any Stacks address instantly</p>
      </div>

      <div className="glass-card p-8 max-w-lg mx-auto space-y-6 relative overflow-hidden">
        {!userData && (
          <div className="absolute inset-0 z-10 bg-[var(--background)]/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-xl">
              <Send className="w-8 h-8 text-white/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Connect Your Wallet</h3>
              <p className="text-sm text-white/50">You need to connect your Hiro wallet to send STX</p>
            </div>
            <button onClick={connectWallet} className="btn-primary w-full max-w-[200px]">
              Connect Wallet
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Recipient Address</label>
            <input
              type="text"
              placeholder="SP..."
              className="input-field w-full"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 ml-1">Amount (STX)</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                className="input-field w-full pr-16"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-white/20">STX</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={status === "pending" || !recipient || !amount}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          {status === "pending" ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send STX
            </>
          )}
        </button>

        <AnimatePresence>
          {status !== "idle" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 pt-4 border-t border-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Status</span>
                <StatusBadge status={status} />
              </div>

              {status === "success" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 flex flex-col gap-2">
                  <p className="text-xs truncate opacity-80 font-mono">TX: {txId}</p>
                  <a 
                    href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline hover:text-emerald-300 font-medium"
                  >
                    View on Explorer
                  </a>
                </div>
              )}

              {status === "failed" && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMessage}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
        <div className="glass-card p-4 text-center space-y-1">
          <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Fee</p>
          <p className="font-medium text-sm">~0.001 STX</p>
        </div>
        <div className="glass-card p-4 text-center space-y-1">
          <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Speed</p>
          <p className="font-medium text-sm">~10 mins</p>
        </div>
        <div className="glass-card p-4 text-center space-y-1">
          <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Network</p>
          <p className="font-medium text-sm text-[var(--primary)]">Mainnet</p>
        </div>
      </div>
    </div>
  );
}
