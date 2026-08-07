import { db } from '../db';

export interface Group {
  id: string;
  name: string;
  creator_id: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
}

export class GroupService {
  private db = db;

  async createGroup(name: string, creatorId: string) {
    try {
      const result = await this.db.query(
        'INSERT INTO groups (name, creator_id) VALUES ($1, $2) RETURNING *',
        [name, creatorId]
      );
      const newGroup = result.rows[0];

      // Auto-add creator as member
      await this.addMember(newGroup.id, creatorId);

      return newGroup;
    } catch (e) {
      console.error('DB error in createGroup', e);
      throw e;
    }
  }

  async getGroupDetails(id: string) {
    try {
      const groupResult = await this.db.query('SELECT * FROM groups WHERE id = $1', [id]);
      if (groupResult.rows.length === 0) return null;

      const membersResult = await this.db.query(
        'SELECT u.id, u.full_name FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = $1',
        [id]
      );

      return {
        ...groupResult.rows[0],
        members: membersResult.rows
      };
    } catch (e) {
      console.error('DB error in getGroupDetails', e);
      throw e;
    }
  }

  async addMember(groupId: string, userId: string) {
    try {
      await this.db.query(
        'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [groupId, userId]
      );
      return true;
    } catch (e) {
      console.error('DB error in addMember', e);
      throw e;
    }
  }
  async getUserGroups(userId: string) {
    try {
      const result = await this.db.query(
        `SELECT g.id, g.name, g.creator_id, 
          (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id) as members,
          'Vừa xong' as time,
          'Nhóm vừa được tạo' as last_message,
          'https://i.pravatar.cc/150?u=' || g.id as avatar
         FROM groups g 
         JOIN group_members gm ON g.id = gm.group_id 
         WHERE gm.user_id = $1
         ORDER BY g.id DESC`,
        [userId]
      );
      return result.rows;
    } catch (e) {
      console.error('DB error in getUserGroups', e);
      throw e;
    }
  }

  async getMessages(groupId: string) {
    try {
      const result = await this.db.query(
        `SELECT m.id, m.group_id, m.sender_id, m.message, m.created_at, u.full_name as sender_name
         FROM group_messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.group_id = $1
         ORDER BY m.created_at ASC`,
        [groupId]
      );
      return result.rows;
    } catch (e) {
      console.error('DB error in getMessages', e);
      throw e;
    }
  }

  async getActiveOrder(groupId: string) {
    const result = await this.db.query(
      `SELECT * FROM group_orders WHERE group_id = $1 AND status != 'CLOSED' ORDER BY created_at DESC LIMIT 1`,
      [groupId]
    );
    if (result.rows.length === 0) return null;
    const order = result.rows[0];

    // Lấy participants
    const partsRes = await this.db.query(
      `SELECT p.user_id, u.full_name FROM group_order_participants p 
       JOIN users u ON p.user_id = u.id WHERE p.order_id = $1`,
      [order.id]
    );
    order.participants = partsRes.rows;

    // Lấy votes
    const votesRes = await this.db.query(
      `SELECT restaurant_id, COUNT(*) as vote_count FROM group_order_votes WHERE order_id = $1 GROUP BY restaurant_id`,
      [order.id]
    );
    order.votes = votesRes.rows;

    // Lấy items
    const itemsRes = await this.db.query(
      `SELECT i.*, u.full_name as user_name, d.name as dish_name 
       FROM group_order_items i 
       JOIN users u ON i.user_id = u.id 
       JOIN dishes d ON i.dish_id = d.id 
       WHERE i.order_id = $1`,
      [order.id]
    );
    order.items = itemsRes.rows;

    return order;
  }

  async createOrder(groupId: string, creatorId: string) {
    // Đóng các order cũ nếu có
    await this.db.query(`UPDATE group_orders SET status = 'CLOSED' WHERE group_id = $1`, [groupId]);
    
    // Tạo order mới
    const result = await this.db.query(
      `INSERT INTO group_orders (group_id, creator_id, status) VALUES ($1, $2, 'PENDING') RETURNING *`,
      [groupId, creatorId]
    );
    const order = result.rows[0];
    
    // Add creator to participants
    await this.db.query(
      `INSERT INTO group_order_participants (order_id, user_id) VALUES ($1, $2)`,
      [order.id, creatorId]
    );

    return order;
  }

  async joinOrder(orderId: string, userId: string) {
    await this.db.query(
      `INSERT INTO group_order_participants (order_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [orderId, userId]
    );
    return true;
  }

  async updateOrderStatus(orderId: string, status: string, restaurantId?: string) {
    if (restaurantId) {
      await this.db.query(`UPDATE group_orders SET status = $1, selected_restaurant_id = $2 WHERE id = $3`, [status, restaurantId, orderId]);
    } else {
      await this.db.query(`UPDATE group_orders SET status = $1 WHERE id = $2`, [status, orderId]);
    }
  }

  async voteRestaurant(orderId: string, userId: string, restaurantId: string) {
    await this.db.query(
      `INSERT INTO group_order_votes (order_id, user_id, restaurant_id) VALUES ($1, $2, $3)
       ON CONFLICT (order_id, user_id) DO UPDATE SET restaurant_id = EXCLUDED.restaurant_id`,
      [orderId, userId, restaurantId]
    );
  }

  async addItemToOrder(orderId: string, userId: string, dishId: string, quantity: number, price: number) {
    await this.db.query(
      `INSERT INTO group_order_items (order_id, user_id, dish_id, quantity, price) VALUES ($1, $2, $3, $4, $5)`,
      [orderId, userId, dishId, quantity, price]
    );
    
    // Cập nhật total_amount
    await this.db.query(
      `UPDATE group_orders SET total_amount = total_amount + $1 WHERE id = $2`,
      [price * quantity, orderId]
    );
  }
}

export const groupService = new GroupService();
