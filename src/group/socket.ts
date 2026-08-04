import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

// In-memory store for active votes
// For MVP, we use a simple structure: 
// groupId -> { options: { restaurantId: number of votes }, userVotes: { userId: restaurantId } }
export interface VoteState {
  options: { [restaurantId: string]: number };
  userVotes: { [userId: string]: string };
}

const activeVotes = new Map<string, VoteState>();

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // For development, allow all origins
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific group room
    socket.on('joinGroup', (groupId: string) => {
      socket.join(groupId);
      console.log(`Socket ${socket.id} joined group ${groupId}`);
      
      // If there is an active vote, send it to the newly joined client
      if (activeVotes.has(groupId)) {
        socket.emit('voteUpdate', activeVotes.get(groupId));
      }
    });

    // Leave a specific group room
    socket.on('leaveGroup', (groupId: string) => {
      socket.leave(groupId);
      console.log(`Socket ${socket.id} left group ${groupId}`);
    });

    // Start a voting session
    socket.on('startVote', (groupId: string, restaurantIds: string[]) => {
      console.log(`Vote started in group ${groupId} for options:`, restaurantIds);
      const options: { [id: string]: number } = {};
      restaurantIds.forEach(id => {
        options[id] = 0;
      });

      const newVoteState: VoteState = {
        options,
        userVotes: {}
      };
      activeVotes.set(groupId, newVoteState);
      
      // Broadcast to all clients in the group
      io.to(groupId).emit('voteUpdate', newVoteState);
    });

    // Cast a vote
    socket.on('castVote', (groupId: string, userId: string, restaurantId: string) => {
      const voteState = activeVotes.get(groupId);
      if (!voteState) return; // No active vote
      
      // Prevent voting for a restaurant not in the options
      if (voteState.options[restaurantId] === undefined) return;

      const previousVote = voteState.userVotes[userId];
      
      if (previousVote) {
        if (previousVote === restaurantId) return; // Already voted for this
        // Remove previous vote
        voteState.options[previousVote]--;
      }

      // Add new vote
      voteState.options[restaurantId]++;
      voteState.userVotes[userId] = restaurantId;

      console.log(`User ${userId} voted for ${restaurantId} in group ${groupId}`);

      // Broadcast update
      io.to(groupId).emit('voteUpdate', voteState);
    });

    // End a voting session
    socket.on('endVote', (groupId: string) => {
      activeVotes.delete(groupId);
      io.to(groupId).emit('voteEnded');
      console.log(`Vote ended for group ${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
