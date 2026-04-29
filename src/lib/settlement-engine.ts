/**
 * Settlement Engine - Minimum Cash Flow Algorithm
 * Simplifies debts within a group to minimize the number of transactions.
 */

type Debt = {
  from: string;
  to: string;
  amount: number;
  fromName?: string;
  toName?: string;
  toUpiId?: string;
  toBank?: {
    accountNumber: string;
    ifsc: string;
  };
};

export function simplifyDebts(rawBalances: { userAId: string, userBId: string, amount: number, userA: any, userB: any }[]): Debt[] {
  const netBalances: Record<string, { amount: number, name: string, upiId?: string, bank?: any }> = {};

  // 1. Calculate net balance for each user
  rawBalances.forEach(balance => {
    const { userAId, userBId, amount, userA, userB } = balance;
    
    if (!netBalances[userAId]) netBalances[userAId] = { 
      amount: 0, 
      name: userA.name, 
      upiId: userA.upiId,
      bank: userA.bankAccountNumber ? { accountNumber: userA.bankAccountNumber, ifsc: userA.ifscCode } : undefined
    };
    if (!netBalances[userBId]) netBalances[userBId] = { 
      amount: 0, 
      name: userB.name, 
      upiId: userB.upiId,
      bank: userB.bankAccountNumber ? { accountNumber: userB.bankAccountNumber, ifsc: userB.ifscCode } : undefined
    };

    // userA owes userB 'amount'
    netBalances[userAId].amount -= amount;
    netBalances[userBId].amount += amount;
  });

  const creditors: { id: string, amount: number, name: string, upiId?: string, bank?: any }[] = [];
  const debtors: { id: string, amount: number, name: string }[] = [];

  // 2. Separate users into creditors (positive net) and debtors (negative net)
  Object.entries(netBalances).forEach(([id, data]) => {
    if (data.amount > 0.01) {
      creditors.push({ id, amount: data.amount, name: data.name, upiId: data.upiId, bank: data.bank });
    } else if (data.amount < -0.01) {
      debtors.push({ id, amount: Math.abs(data.amount), name: data.name });
    }
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplifiedDebts: Debt[] = [];

  let i = 0; // debtor index
  let j = 0; // creditor index

  // 3. Match debtors and creditors
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    simplifiedDebts.push({
      from: debtor.id,
      to: creditor.id,
      fromName: debtor.name,
      toName: creditor.name,
      toUpiId: creditor.upiId,
      toBank: creditor.bank,
      amount: Number(amount.toFixed(2))
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return simplifiedDebts;
}
