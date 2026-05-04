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
        const canEdit = currentUser.id === expense.paidById || currentUser.id === group.adminId;

        return (
          <Card key={expense.id} className="bento-card glass-card group/card hover:border-orange-500/30 transition-all p-0 overflow-hidden w-full rounded-none md:rounded-3xl border-x-0 md:border-x">
            <div className="flex flex-row min-h-[100px]">
              {/* Left Color Bar */}
              <div className="w-1.5 md:w-2 bg-gradient-to-b from-orange-500 to-amber-600 shrink-0" />
              
              <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0 w-full">
                  <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-muted flex items-center justify-center group-hover/card:bg-orange-500/10 transition-colors shrink-0">
                    <Receipt className="h-5 w-5 md:h-7 md:w-7 text-muted-foreground group-hover/card:text-orange-500 transition-colors" />
                  </div>
                  <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
                    <h3 className="text-base md:text-lg font-black tracking-tight break-words whitespace-normal leading-tight">{expense.description}</h3>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs font-medium text-muted-foreground">
                      <span className="flex items-center gap-1 shrink-0">
                        <User className="h-3 w-3" />
                        <span className="break-words whitespace-normal max-w-[120px] md:max-w-none">{expense.paidBy?.name || "Unknown"}</span>
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

                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Amount</p>
                    <p className="text-xl md:text-2xl font-black break-words">₹{expense.amount.toFixed(2)}</p>
                  </div>
                    
                    <div className="flex items-center gap-1 md:gap-2">
                      {canEdit ? (
                        <>
                          <AddExpenseDialog group={group} currentUser={currentUser} expense={expense} />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex h-8 w-8 rounded-full border border-white/5 items-center justify-center opacity-20">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
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
