import { SplitBillService } from '../src/group/splitBill';

describe('SplitBillService', () => {
  const service = new SplitBillService();

  it('allocates rounding remainder without losing cents', () => {
    const result = service.splitEqually(100, ['a', 'b', 'c']);

    expect(result.map((item) => item.amount)).toEqual([33.34, 33.33, 33.33]);
    expect(result.reduce((sum, item) => sum + item.amount, 0)).toBeCloseTo(100, 2);
  });

  it('rejects duplicate participants and invalid totals', () => {
    expect(() => service.splitEqually(-1, ['a'])).toThrow();
    expect(() => service.splitEqually(10, ['a', 'a'])).toThrow();
    expect(() => service.splitEqually(Number.NaN, ['a'])).toThrow();
  });

  it('splits item cents exactly and rejects duplicate assignment', () => {
    const result = service.splitByItems([
      { id: 'item', name: 'Soup', amount: 10, assigned_users: ['a', 'b', 'c'] }
    ]);

    expect(result.map((item) => item.amount)).toEqual([3.34, 3.33, 3.33]);
    expect(() => service.splitByItems([
      { id: 'bad', name: 'Bad', amount: 10, assigned_users: ['a', 'a'] }
    ])).toThrow();
  });
});
