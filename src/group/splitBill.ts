export interface BillItem {
  id: string;
  name: string;
  amount: number;
  assigned_users: string[]; // user IDs
}

export interface SplitResult {
  userId: string;
  amount: number;
}

export class SplitBillService {
  /**
   * Split a bill equally among given users.
   */
  splitEqually(totalAmount: number, userIds: string[]): SplitResult[] {
    if (userIds.length === 0) return [];
    
    const splitAmount = Math.round((totalAmount / userIds.length) * 100) / 100;
    
    return userIds.map(userId => ({
      userId,
      amount: splitAmount
    }));
  }

  /**
   * Split a bill by items (each item can be assigned to one or more users).
   */
  splitByItems(items: BillItem[]): SplitResult[] {
    const userTotals = new Map<string, number>();

    for (const item of items) {
      const assignedCount = item.assigned_users.length;
      if (assignedCount === 0) continue;

      const splitAmount = item.amount / assignedCount;

      for (const userId of item.assigned_users) {
        const currentAmount = userTotals.get(userId) || 0;
        userTotals.set(userId, currentAmount + splitAmount);
      }
    }

    const results: SplitResult[] = [];
    userTotals.forEach((amount, userId) => {
      results.push({ userId, amount: Math.round(amount * 100) / 100 });
    });

    return results;
  }
}

export const splitBillService = new SplitBillService();
