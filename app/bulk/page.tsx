"use client";

import { useState, useMemo } from "react";
import { useStacks } from "@/hooks/use-stacks";
// import { request } from "@stacks/connect"; // Use dynamic import for client-side only
import { STACKS_MAINNET } from "@stacks/network";
import { Layers, Plus, Trash2, Upload, FileJson, Send, AlertCircle, CheckCircle2, Loader2, Info, ClipboardPaste } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

interface Recipient {
  id: string;
  address: string;
  amount: string;
  status: "idle" | "pending" | "success" | "failed";
  error?: string;
}

export default function BulkSendPage() {
  const { userData, connectWallet } = useStacks();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: Math.random().toString(), address: "", amount: "", status: "idle" }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteData, setPasteData] = useState("");

  const totalAmount = useMemo(() => {
    return recipients.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [recipients]);

  const addRow = () => {
    setRecipients([...recipients, { id: Math.random().toString(), address: "", amount: "", status: "idle" }]);
  };

  const removeRow = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof Recipient, value: any) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const rows = results.data as string[][];
        const newRecipients = rows.map(row => ({
          id: Math.random().toString(),
          address: row[0] || "",
          amount: row[1] || "",
          status: "idle" as const
        }));
        setRecipients(newRecipients);
      }
    });
  };

  const handlePaste = () => {
    Papa.parse(pasteData, {
      header: false,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const rows = results.data as string[][];
        const newRecipients = rows.map(row => ({
          id: Math.random().toString(),
          address: row[0]?.trim() || "",
          amount: row[1]?.trim() || "",
          status: "idle" as const
        }));
        if (newRecipients.length > 0) {
          setRecipients(newRecipients);
          setShowPaste(false);
          setPasteData("");
        }
      }
    });
  };
  const handleSendAll = async () => {
    if (!userData) {
      connectWallet();
      return;
    }

    setIsSending(true);
    
    // We'll iterate through them. In a real app, one might use a smart contract for bulk transfers.
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      if (!recipient.address || !recipient.amount) continue;

      updateRow(recipient.id, "status", "pending");

      try {
        const { request } = await import("@stacks/connect");
        const response = await request("stx_transferStx", {
          recipient: recipient.address,
          amount: (parseFloat(recipient.amount) * 1000000).toString(),
          memo: "Bulk Send via Tippy",
        });

        if (response.txid) {
          setRecipients(prev => prev.map(r => r.id === recipient.id ? { ...r, status: "success" } : r));
        } else {
          setRecipients(prev => prev.map(r => r.id === recipient.id ? { ...r, status: "idle" } : r));
          break; // Stop on cancel
        }
      } catch (err) {
        setRecipients(prev => prev.map(r => r.id === recipient.id ? { ...r, status: "failed", error: "Failed or Canceled" } : r));
        // Continue to next or stop? Usually stop on error for safety
        break;
      }
    }

    setIsSending(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Bulk Send</h1>
        <p className="text-white/50">Send STX to multiple addresses in one go</p>
      </div>

      <div className="glass-card p-6 space-y-6 relative overflow-hidden">
        {!userData && (
          <div className="absolute inset-0 z-10 bg-[var(--background)]/60 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-xl">
              <Layers className="w-8 h-8 text-white/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Connect Your Wallet</h3>
              <p className="text-sm text-white/50">You need to connect your Hiro wallet to bulk send STX</p>
            </div>
            <button onClick={connectWallet} className="btn-primary w-full max-w-[200px]">
              Connect Wallet
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Recipients List</h2>
            <p className="text-sm text-white/40">Add rows manually or upload a CSV file</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPaste(!showPaste)}
              className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste CSV
            </button>
            <label className="btn-secondary py-2 px-4 text-sm flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button onClick={addRow} className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>
        </div>

        {showPaste && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/50">Paste address and amount (one per line, comma separated)</label>
              <textarea
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                placeholder="SP..., 1.5&#10;SP..., 2.0"
                className="input-field w-full h-32 font-mono text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => setShowPaste(false)} className="text-xs text-white/40 hover:text-white px-4 py-2">Cancel</button>
                <button onClick={handlePaste} className="btn-primary py-2 px-6 text-xs">Import Data</button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {recipients.map((recipient, index) => (
              <motion.div
                key={recipient.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-white/5 p-3 rounded-2xl border border-white/5"
              >
                <div className="flex-1 w-full space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Address</label>
                  <input
                    placeholder="Recipient STX Address"
                    value={recipient.address}
                    onChange={(e) => updateRow(recipient.id, "address", e.target.value)}
                    className="input-field w-full py-2 bg-transparent"
                  />
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={recipient.amount}
                    onChange={(e) => updateRow(recipient.id, "amount", e.target.value)}
                    className="input-field w-full py-2 bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1 sm:pt-4">
                  <div className="w-24 flex items-center justify-center">
                    <StatusBadge status={recipient.status} />
                  </div>
                  <button
                    onClick={() => removeRow(recipient.id)}
                    className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-white/30">Total Recipients</p>
              <p className="text-xl font-bold">{recipients.length}</p>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-white/30">Total STX</p>
              <p className="text-xl font-bold text-[var(--accent)]">{totalAmount.toFixed(2)} STX</p>
            </div>
          </div>

          <button
            onClick={handleSendAll}
            disabled={isSending || totalAmount === 0}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-3 px-12 py-4 shadow-xl shadow-primary/20"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send All
              </>
            )}
          </button>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
          <p className="text-xs text-blue-300 leading-relaxed">
            Note: You will be prompted by your wallet to sign each transaction sequentially. 
            Ensure your wallet has enough balance to cover the total amount and network fees for each transaction.
          </p>
        </div>
      </div>
    </div>
  );
}
