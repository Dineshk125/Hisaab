"use client";

import { useState } from "react";
import { approveSettlement, rejectSettlement } from "@/actions/expense";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Clock, Wallet, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function PendingSettlements({ settlements, currentUser }: { settlements: any[]; currentUser: any }) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!settlements || settlements.length === 0) return null;

  const handleApprove = async (id: string) => {
    setLoading(id);
    try {
      await approveSettlement(id);
      toast.success("Payment confirmed! Balance updated. ✅");
    } catch (error) {
      toast.error("Failed to approve settlement");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(id);
    try {
      await rejectSettlement(id);
      toast.error("Payment rejected");
    } catch (error) {
      toast.error("Failed to reject");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 px-1">
        <Clock className="h-4 w-4 text-orange-500 animate-pulse" />
        <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Confirm Received Payments</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {settlements.map((s) => (
          <Card key={s.id} className="bento-card bg-orange-500/5 border-orange-500/20 overflow-hidden group">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 border-2 border-orange-500/20 shadow-sm">
                  <AvatarFallback className="bg-orange-500/10 text-orange-500 font-bold uppercase">
                    {s.fromUser.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-black text-orange-500/60 uppercase tracking-tighter">Marked as Paid by</p>
                  <p className="text-sm font-bold truncate">{s.fromUser.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</p>
                  <p className="text-lg font-black text-orange-500">₹{s.amount.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-10 w-10 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10"
                    onClick={() => handleReject(s.id)}
                    disabled={!!loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                    onClick={() => handleApprove(s.id)}
                    disabled={!!loading}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
