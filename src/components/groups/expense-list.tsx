"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Calendar, User, Trash2, ArrowRight } from "lucide-react";
import { AddExpenseDialog } from "./add-expense-dialog";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/actions/expense";
import { toast } from "sonner";

export function ExpenseList({ 
  expenses, 
  group, 
  currentUser 
}: { 
  expenses: any[]; 
  group: any; 
  currentUser: any;
}) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-6 bg-muted rounded-3xl">
          <Receipt className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">No expenses yet</h3>
          <p className="text-muted-foreground">Start adding expenses to see them here.</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6 w-full">
      {expenses.map((expense) => {
        const canEdit = currentUser?.id === expense.paidById || 
                        currentUser?.email === expense.paidBy?.email || 
                        currentUser?.id === group.adminId;

        return (
          <Card key={expense.id} className="bento-card glass-card group/card hover:border-orange-500/30 transition-all p-0 overflow-hidden w-full rounded-none md:rounded-3xl border-x-0 md:border-x relative">
            {canEdit && (
              <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
                <AddExpenseDialog group={group} currentUser={currentUser} expense={expense} />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 md:h-8 md:w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => handleDelete(expense.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            )}

            <div className="flex flex-row min-h-[100px]">
              {/* Left Color Bar */}
              <div className="w-1.5 md:w-2 bg-gradient-to-b from-orange-500 to-amber-600 shrink-0" />
              
              <div className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_auto] items-start md:items-center justify-between gap-4 w-full pr-12 md:pr-14">
                <div className="flex items-start md:items-center gap-3 md:gap-4 min-w-0 w-full">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-muted flex items-center justify-center group-hover/card:bg-orange-500/10 transition-colors shrink-0">
                    <Receipt className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover/card:text-orange-500 transition-colors" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-black tracking-tight break-words whitespace-normal leading-normal">{expense.description}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1 shrink-0">
                        <User className="h-3 w-3" />
                        <span className="break-words max-w-[100px] md:max-w-none">{expense.paidBy?.name || "Unknown"}</span>
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3" />
                        {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <Badge variant="outline" className="text-[8px] md:text-[10px] uppercase font-black px-1.5 py-0 border-white/10 shrink-0">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5 shrink-0 min-w-[100px]">
                  <div className="text-left md:text-right">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Amount</p>
                    <p className="text-lg md:text-xl font-black break-words">₹{expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
