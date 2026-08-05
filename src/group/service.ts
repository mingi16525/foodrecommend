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
}

export const groupService = new GroupService();
