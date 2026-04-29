"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, QrCode, Save, User, Building2, CreditCard } from "lucide-react";

export function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [upiId, setUpiId] = useState(user.upiId || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(user.bankAccountNumber || "");
  const [ifscCode, setIfscCode] = useState(user.ifscCode || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, upiId, bankAccountNumber, ifscCode });
      toast.success("Payment details updated! 🚀");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-8">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <User className="h-3 w-3" />
            Display Name
          </Label>
          <Input 
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl bg-white/5 border-white/10 text-base font-bold"
            placeholder="Your Name"
          />
        </div>

        {/* UPI Info */}
        <div className="space-y-2">
          <Label htmlFor="upiId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <QrCode className="h-3 w-3 text-orange-500" />
            UPI ID (Primary)
          </Label>
          <div className="relative">
            <Input 
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="h-12 rounded-xl bg-white/5 border-white/10 pr-10 font-medium"
              placeholder="e.g. user@okaxis"
            />
            {upiId && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-6 w-6 rounded-md bg-orange-500/10 flex items-center justify-center">
                  <QrCode className="h-3 w-3 text-orange-500" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bank Info Section */}
        <div className="pt-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-500">Bank Transfer (Optional)</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input 
                  id="bankAccount"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="h-12 pl-10 rounded-xl bg-white/5 border-white/10 font-mono text-sm"
                  placeholder="0000 0000 0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifsc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">IFSC Code</Label>
              <Input 
                id="ifsc"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="h-12 rounded-xl bg-white/5 border-white/10 font-mono text-sm uppercase"
                placeholder="HDFC0001234"
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">
            Provide these if you prefer receiving money directly in your bank account.
          </p>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 font-black text-lg gap-2 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
        Save Details
      </Button>
    </form>
  );
}
