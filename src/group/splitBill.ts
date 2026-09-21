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
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      throw new Error('totalAmount must be a non-negative finite number');
    }
    if (userIds.length === 0 || new Set(userIds).size !== userIds.length) {
      throw new Error('userIds must contain at least one unique user');
    }

    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / userIds.length);
    const remainderCents = totalCents % userIds.length;

    return userIds.map((userId, index) => ({
      userId,
      amount: (baseCents + (index < remainderCents ? 1 : 0)) / 100
    }));
  }

  /**
   * Split a bill by items (each item can be assigned to one or more users).
   */
  splitByItems(items: BillItem[]): SplitResult[] {
    const userTotals = new Map<string, number>();

    for (const item of items) {
      if (!Number.isFinite(item.amount) || item.amount < 0 || item.assigned_users.length === 0 ||
        new Set(item.assigned_users).size !== item.assigned_users.length) {
        throw new Error('Each item must have a non-negative amount and unique assigned users');
      }
      const assignedCount = item.assigned_users.length;
      const totalCents = Math.round(item.amount * 100);
      const baseCents = Math.floor(totalCents / assignedCount);
      const remainderCents = totalCents % assignedCount;

      item.assigned_users.forEach((userId, index) => {
        const currentAmount = userTotals.get(userId) || 0;
        const itemShare = (baseCents + (index < remainderCents ? 1 : 0)) / 100;
        userTotals.set(userId, currentAmount + itemShare);
      });
    }

    const results: SplitResult[] = [];
    userTotals.forEach((amount, userId) => {
      results.push({ userId, amount: Math.round(amount * 100) / 100 });
    });

    return results;
  }
}

export const splitBillService = new SplitBillService();
