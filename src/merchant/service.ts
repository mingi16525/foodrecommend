import { Pool } from 'pg';

export class MerchantService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
    });
  }

  async getAnalytics(merchantId: string) {
    console.log(`Fetching analytics for merchant ${merchantId}`);
    // Mock analytics
    return {
      views: 12543,
      likes: 3421,
      orderClicks: 890,
      recentTrend: '+12%',
      popularDish: 'Bún Chả Hà Nội'
    };
  }

  async getMenu(merchantId: string) {
    console.log(`Fetching menu for merchant ${merchantId}`);
    // Mock menu
    return [
      { id: 'm1', name: 'Bún Chả Hà Nội', price: 55000, isPromoted: true },
      { id: 'm2', name: 'Nem Rán', price: 15000, isPromoted: false },
      { id: 'm3', name: 'Trà Đá', price: 5000, isPromoted: false }
    ];
  }

  async promoteListing(merchantId: string, dishId: string, budget: number) {
    console.log(`Promoting dish ${dishId} for merchant ${merchantId} with budget ${budget}`);
    // In reality: Update DB and billing
    return {
      success: true,
      message: `Dish ${dishId} promoted successfully with a budget of ${budget}`
    };
  }
}

export const merchantService = new MerchantService();
