import { Pool } from 'pg';

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
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://fooduser:foodpassword@localhost:5432/foodrecommend'
    });
  }

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
      console.warn('DB error in createGroup', e);
      return { id: 'mock_group_id', name, creator_id: creatorId };
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
      console.warn('DB error in getGroupDetails', e);
      return { id, name: 'Mock Group', members: [{ id: 'mock_user_id', full_name: 'Mock Member' }] };
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
      console.warn('DB error in addMember', e);
      return true;
    }
  }
}

export const groupService = new GroupService();
