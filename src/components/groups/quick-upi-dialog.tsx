"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, QrCode, Sparkles } from "lucide-react";

export function QuickUpiDialog({ currentUser }: { currentUser: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState(currentUser.upiId || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId) return;
    
    setLoading(true);
    try {
      await updateProfile({ upiId });
      toast.success("UPI ID added! You're ready to get paid. ✅");
      setOpen(false);
    } catch (error: any) {
      toast.error("Failed to update UPI ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="h-9 md:h-10 rounded-xl bg-orange-500/5 text-orange-500 border-orange-500/20 hover:bg-orange-500/10 font-bold text-[10px] md:text-xs gap-2 shrink-0 shadow-sm transition-all hover:scale-105">
          <QrCode className="h-3 w-3 md:h-4 md:w-4" />
          Add UPI to Get Paid
          <Sparkles className="h-3 w-3 animate-pulse" />
        </Button>
      } />
      <DialogContent className="sm:max-w-md rounded-3xl border-white/5 bg-background/95 backdrop-blur-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Enable QR Payments</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-4 bg-orange-500/10 rounded-2xl">
              <QrCode className="h-10 w-10 text-orange-500" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              People owe you money! Add your UPI ID so they can scan and pay you instantly.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-upi" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your UPI ID</Label>
              <Input 
                id="quick-upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="h-12 rounded-xl bg-white/5 border-white/10 font-medium"
                placeholder="e.g. mobile@upi or name@okaxis"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading || !upiId} 
              className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 font-bold gap-2 shadow-lg shadow-orange-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Save & Enable Payments
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
