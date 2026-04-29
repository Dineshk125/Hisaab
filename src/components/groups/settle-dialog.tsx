"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { settleUp } from "@/actions/expense";
import { Loader2, Share2, AlertCircle, CheckCircle2, Building2, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function SettleDialog({ 
  balance, 
  debtor, 
  creditor, 
  amount, 
  groupId, 
  currentUser 
}: { 
  balance: any; 
  debtor: any; 
  creditor: any; 
  amount: number; 
  groupId: string;
  currentUser: any;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasCustomUpi = !!balance.toUpiId;
  const upiId = balance.toUpiId || "6350542995@ybl"; 
  const bank = balance.toBank;
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(creditor.name)}&am=${amount}&cu=INR&tn=Hisaab Settlement`;

  const handleSettle = async () => {
    setLoading(true);
    try {
      await settleUp({
        amount,
        groupId,
        fromUserId: debtor.id,
        toUserId: creditor.id,
      });
      toast.success("Settlement recorded! ✅");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to record settlement");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleWhatsAppShare = () => {
    const text = `Hi ${creditor.name}, I'm settling ₹${amount.toFixed(2)} in our Hisaab group. ${upiId ? `Paying to ${upiId}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const isDebtor = currentUser.id === debtor.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant={isDebtor ? "default" : "outline"} size="sm" className="rounded-xl font-bold h-9">
          Settle Up
        </Button>
      } />
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-white/5 bg-background/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-center">Quick Settlement</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-2 space-y-8">
          {/* Amount Display */}
          <div className="text-center space-y-1">
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">You are paying</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-5xl font-black gradient-text">₹{amount.toFixed(2)}</span>
            </div>
            <p className="text-sm font-bold text-muted-foreground">To {creditor.name}</p>
          </div>

          {/* QR Code Section */}
          <div className="relative group w-full flex flex-col items-center">
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 to-amber-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white p-6 rounded-[2rem] shadow-2xl">
              <QRCodeSVG 
                value={upiUrl} 
                size={180} 
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="mt-4 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-emerald-500">
                {!hasCustomUpi && <Sparkles className="h-3 w-3 text-orange-500" />}
                <span className={`text-xs font-bold ${!hasCustomUpi ? 'text-orange-500' : ''}`}>
                  {upiId} {!hasCustomUpi && "(Default)"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Scan with any UPI app</p>
            </div>
          </div>

          {/* Bank Details (If available) */}
          {bank && (
            <div className="w-full space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Bank Transfer</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg">
                    <p className="text-xs font-mono font-bold tracking-wider">{bank.accountNumber}</p>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(bank.accountNumber, "Account")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 w-full pt-2">
            <Button 
              className="h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 font-black text-lg shadow-xl shadow-orange-500/20 gap-2 transition-all active:scale-95"
              onClick={handleSettle} 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              Mark as Paid
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-12 rounded-2xl font-bold border-white/10 hover:bg-white/5 gap-2" 
                onClick={handleWhatsAppShare}
              >
                <Share2 className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button 
                variant="ghost" 
                className="h-12 rounded-2xl font-bold text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
