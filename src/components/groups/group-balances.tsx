"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SettleDialog } from "./settle-dialog";
import { TrendingDown, TrendingUp, HandCoins, ArrowRightLeft, Sparkles, BellRing, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sendReminder } from "@/actions/member";
import { toast } from "sonner";
import { QuickUpiDialog } from "./quick-upi-dialog";

export function GroupBalances({ 
  balances: balanceData, 
  group,
  currentUser,
  groupId
}: { 
  balances: { raw: any[], simplified: any[] }; 
  group: any;
  currentUser: any;
  groupId: string;
}) {
  const { simplified: balances } = balanceData;

  // Check if current user is a creditor in any debt and has no UPI
  const userIsCreditor = balances.some(d => d.to === currentUser.id);
  const userHasUpi = !!currentUser.upiId;

  if (balances.length === 0) {
    return (
      <Card className="bento-card glass-card w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="p-4 bg-emerald-500/10 rounded-full">
            <TrendingUp className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Everyone is settled!</h3>
            <p className="text-sm text-muted-foreground">All debts have been paid. Great job!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center gap-2 md:gap-3">
          <ArrowRightLeft className="h-4 w-4 md:h-5 md:w-5 text-orange-500 shrink-0" />
          <h2 className="text-lg md:text-xl font-black tracking-tight">Smart Settlements</h2>
          <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20 flex gap-1 items-center px-2 py-0.5 shrink-0">
            <Sparkles className="h-3 w-3" />
            <span className="text-[10px]">Optimized</span>
          </Badge>
        </div>
        
        {userIsCreditor && !userHasUpi && (
          <div className="w-fit">
            <QuickUpiDialog currentUser={currentUser} />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6 w-full">
        {balances.map((debt, i) => {
          const debtor = { id: debt.from, name: debt.fromName };
          const creditor = { id: debt.to, name: debt.toName };
          const absAmount = debt.amount;

          const isDebtor = currentUser.id === debtor.id;
          const isCreditor = currentUser.id === creditor.id;
          const isInvolved = isDebtor || isCreditor;

          return (
            <Card 
              key={i} 
              className={`bento-card glass-card border-l-4 transition-all w-full overflow-hidden ${
                isInvolved 
                  ? isDebtor 
                    ? "border-l-destructive" 
                    : "border-l-emerald-500"
                  : "border-l-muted"
              }`}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                  {/* User Flow */}
                  <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                    <div className="flex items-center -space-x-1.5 md:-space-x-2 shrink-0">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 md:border-4 border-background ring-1 ring-destructive/20 shadow-lg">
                        <AvatarFallback className="text-[10px] md:text-xs font-bold bg-muted uppercase">{debtor.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-background flex items-center justify-center z-10 border border-white/5 shadow-md">
                        <HandCoins className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
                      </div>
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 md:border-4 border-background ring-1 ring-emerald-500/20 shadow-lg">
                        <AvatarFallback className="text-[10px] md:text-xs font-bold bg-muted uppercase">{creditor.name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="space-y-0.5 md:space-y-1 min-w-0">
                      <p className="text-[10px] md:text-xs font-bold flex items-center gap-1.5 text-muted-foreground truncate">
                        {debtor.name} 
                        <TrendingDown className="h-2.5 w-2.5 text-destructive shrink-0" />
                      </p>
                      <p className="text-sm md:text-lg font-black truncate">{creditor.name}</p>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/5 gap-2">
                    <div className="text-left md:text-right">
                      <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Amount Due</p>
                      <p className={`text-xl md:text-2xl lg:text-3xl font-black ${isDebtor ? 'text-destructive' : isCreditor ? 'text-emerald-500' : ''}`}>
                        ₹{absAmount.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1.5 md:gap-2">
                      {isCreditor && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 md:h-9 px-2 md:px-3 rounded-xl text-orange-500 hover:bg-orange-500/10 font-bold text-[10px] md:text-xs"
                          onClick={async () => {
                            try {
                              await sendReminder({ groupId, toUserId: debtor.id, amount: absAmount });
                              toast.success(`Nudged ${debtor.name}! 🔔`);
                            } catch (err) {
                              toast.error("Failed to send reminder");
                            }
                          }}
                        >
                          <BellRing className="mr-1.5 h-3 w-3 md:h-4 md:w-4" />
                          Nudge
                        </Button>
                      )}
                      <SettleDialog 
                        balance={debt} 
                        debtor={debtor} 
                        creditor={creditor}
                        amount={absAmount}
                        groupId={groupId}
                        currentUser={currentUser}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
