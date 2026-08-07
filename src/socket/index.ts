import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { db } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function setupSocket(io: Server) {
  // Middleware xác thực token
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error: Invalid token'));
      (socket as any).user = decoded;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).user.userId;
    console.log(`User connected to socket: ${userId}`);

    // Tham gia phòng chat của nhóm
    socket.on('join_group', (groupId: string) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${userId} joined group_${groupId}`);
    });

    // Rời phòng chat của nhóm
    socket.on('leave_group', (groupId: string) => {
      socket.leave(`group_${groupId}`);
      console.log(`User ${userId} left group_${groupId}`);
    });

    // Gửi tin nhắn
    socket.on('send_message', async (data: { groupId: string, message: string }) => {
      try {
        const { groupId, message } = data;
        
        // Lưu tin nhắn vào DB
        const result = await db.query(
          `INSERT INTO group_messages (group_id, sender_id, message) 
           VALUES ($1, $2, $3) RETURNING *`,
          [groupId, userId, message]
        );
        const savedMessage = result.rows[0];

        // Lấy tên người gửi để broadcast (tối ưu hơn thì join query nhưng làm đơn giản trước)
        const userRes = await db.query('SELECT full_name FROM users WHERE id = $1', [userId]);
        const senderName = userRes.rows[0]?.full_name || 'Unknown';

        const broadcastMsg = {
          id: savedMessage.id,
          group_id: savedMessage.group_id,
          sender_id: savedMessage.sender_id,
          sender_name: senderName,
          message: savedMessage.message,
          created_at: savedMessage.created_at,
          isMe: false // Sẽ được xử lý ở client
        };

        // Gửi tới tất cả user trong group
        io.to(`group_${groupId}`).emit('new_message', broadcastMsg);

      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
}
