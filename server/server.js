// ============================================================================
// MingleUp Real-Time Central Backend Server
// Express + Socket.io + WebRTC Signaling + Voice Rooms + ICE Matrix
// ============================================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Open CORS for all native mobile apps and web clients
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Initialize Socket.io with websocket and polling fallback
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 4000;

// ============================================================================
// IN-MEMORY DATA STORES
// ============================================================================

const connectedUsers = new Map(); // socketId -> User
const userSocketMap = new Map();  // userId -> socketId
const likesStore = new Set();
const matchesStore = [];

let liveRooms = [
  {
    id: 'room-001',
    host_id: 'host-omar',
    title: 'مجلس شباب الرياض ☕🇸🇦 سوالف ونقاشات',
    category: 'chat',
    type: 'audio',
    bg_theme: 'from-brand-950 via-slate-900 to-indigo-950',
    cover_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇸🇦',
    language: 'العربية',
    audience_count: 14,
    is_live: true,
    tags: ['سوالف', 'الرياض', 'تقنية', 'قهوة'],
    seats: [
      { seat_index: 0, user: { id: 'host-omar', display_name: 'عمر الفاروق 👑', custom_id: '8865120', profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80' }, is_muted: false, is_speaking: false },
      { seat_index: 1, user: null, is_muted: false, is_speaking: false },
      { seat_index: 2, user: null, is_muted: false, is_speaking: false },
      { seat_index: 3, user: null, is_muted: false, is_speaking: false },
      { seat_index: 4, user: null, is_muted: false, is_speaking: false },
      { seat_index: 5, user: null, is_muted: false, is_speaking: false },
      { seat_index: 6, user: null, is_muted: false, is_speaking: false },
      { seat_index: 7, user: null, is_muted: false, is_speaking: false },
    ],
    messages: [],
  },
  {
    id: 'room-002',
    host_id: 'host-maya',
    title: 'سهرة طرب وعزف بيانو مباشر 🎵🎹',
    category: 'music',
    type: 'audio',
    bg_theme: 'from-purple-950 via-slate-900 to-rose-950',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    country_flag: '🇱🇧',
    language: 'العربية / English',
    audience_count: 28,
    is_live: true,
    tags: ['موسيقى', 'طرب', 'بيانو', 'غناء'],
    seats: [
      { seat_index: 0, user: { id: 'host-maya', display_name: 'مايا الصالح 👑', custom_id: '8893412', profile_photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80' }, is_muted: false, is_speaking: false },
      { seat_index: 1, user: null, is_muted: false, is_speaking: false },
      { seat_index: 2, user: null, is_muted: false, is_speaking: false },
      { seat_index: 3, user: null, is_muted: false, is_speaking: false },
      { seat_index: 4, user: null, is_muted: false, is_speaking: false },
      { seat_index: 5, user: null, is_muted: false, is_speaking: false },
      { seat_index: 6, user: null, is_muted: false, is_speaking: false },
      { seat_index: 7, user: null, is_muted: false, is_speaking: false },
    ],
    messages: [],
  }
];

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

app.get('/', (req, res) => {
  res.send('MingleUp Real-time Backend is running smoothly 🚀');
});

app.get('/api/health', (req, res) => {
  res.json({
    service: 'mingleup-backend',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    connected_users_count: connectedUsers.size,
    live_rooms_count: liveRooms.length,
  });
});

app.get('/api/ice-servers', (req, res) => {
  res.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  });
});

app.get('/api/users/online', (req, res) => {
  res.json(Array.from(connectedUsers.values()));
});

app.get('/api/rooms', (req, res) => {
  res.json(liveRooms);
});

// ============================================================================
// SOCKET.IO REAL-TIME EVENT HANDLERS
// ============================================================================

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // 1. User Online Registration
  socket.on('USER_ONLINE', (user) => {
    if (!user || !user.id) return;
    connectedUsers.set(socket.id, user);
    userSocketMap.set(user.id, socket.id);
    
    console.log(`[User Registered] ${user.display_name || user.name} (ID: ${user.id})`);
    io.emit('ONLINE_USERS_UPDATE', Array.from(connectedUsers.values()));
  });

  // 2. Swiping & Matching
  socket.on('SWIPE_ACTION', ({ senderUser, targetUserId, isSuperLike }) => {
    if (!senderUser || !targetUserId) return;
    const likeKey = `${senderUser.id}:${targetUserId}`;
    likesStore.add(likeKey);

    const reverseLikeKey = `${targetUserId}:${senderUser.id}`;
    const isMutualMatch = likesStore.has(reverseLikeKey);

    if (isMutualMatch) {
      const matchRecord = {
        id: `match-${Date.now()}`,
        user1: senderUser,
        user2_id: targetUserId,
        created_at: new Date().toISOString(),
      };
      matchesStore.push(matchRecord);

      socket.emit('MATCH_ALERT', {
        matchedUser: { id: targetUserId },
        isMutual: true,
      });

      const targetSocketId = userSocketMap.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('MATCH_ALERT', {
          matchedUser: senderUser,
          isMutual: true,
        });
      }
    }
  });

  // 3. 1-to-1 Chat & Messages
  socket.on('SEND_MESSAGE', (messageData) => {
    const { receiver_id } = messageData;
    const targetSocketId = userSocketMap.get(receiver_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit('NEW_MESSAGE', messageData);
    }
    socket.emit('MESSAGE_DELIVERED', { messageId: messageData?.id });
  });

  // 4. Live Voice Party Rooms
  socket.on('JOIN_ROOM', ({ roomId, user }) => {
    socket.join(roomId);
    const room = liveRooms.find(r => r.id === roomId);
    if (room) {
      room.audience_count = Math.max(1, (room.audience_count || 0) + 1);
      io.to(roomId).emit('ROOM_STATE_UPDATED', room);
      io.to(roomId).emit('ROOM_USER_JOINED', { user, text: `انضم ${user?.display_name || 'مستخدم'} إلى الغرفة ✨` });
    }
  });

  socket.on('LEAVE_ROOM', ({ roomId, user }) => {
    socket.leave(roomId);
    const room = liveRooms.find(r => r.id === roomId);
    if (room) {
      room.audience_count = Math.max(0, (room.audience_count || 1) - 1);
      room.seats.forEach(s => {
        if (s.user?.id === user?.id) {
          s.user = null;
          s.is_speaking = false;
        }
      });
      io.to(roomId).emit('ROOM_STATE_UPDATED', room);
    }
  });

  socket.on('TAKE_SEAT', ({ roomId, seatIndex, user }) => {
    const room = liveRooms.find(r => r.id === roomId);
    if (room && seatIndex >= 0 && seatIndex < room.seats.length) {
      room.seats.forEach(s => {
        if (s.user?.id === user.id) {
          s.user = null;
          s.is_speaking = false;
        }
      });
      room.seats[seatIndex].user = user;
      room.seats[seatIndex].is_muted = false;
      room.seats[seatIndex].is_speaking = false;

      io.to(roomId).emit('ROOM_STATE_UPDATED', room);
      io.to(roomId).emit('ROOM_MESSAGE_BROADCAST', {
        id: `rmsg-${Date.now()}`,
        message_type: 'entry',
        sender: user,
        text: `صعد ${user.display_name || user.name} على المايك رقم ${seatIndex + 1} 🎙️`,
      });
    }
  });

  socket.on('LEAVE_SEAT', ({ roomId, user }) => {
    const room = liveRooms.find(r => r.id === roomId);
    if (room) {
      room.seats.forEach(s => {
        if (s.user?.id === user.id) {
          s.user = null;
          s.is_speaking = false;
        }
      });
      io.to(roomId).emit('ROOM_STATE_UPDATED', room);
    }
  });

  socket.on('TOGGLE_SEAT_MUTE', ({ roomId, seatIndex }) => {
    const room = liveRooms.find(r => r.id === roomId);
    if (room && room.seats[seatIndex]) {
      room.seats[seatIndex].is_muted = !room.seats[seatIndex].is_muted;
      io.to(roomId).emit('ROOM_STATE_UPDATED', room);
    }
  });

  socket.on('SEND_ROOM_MESSAGE', ({ roomId, message }) => {
    io.to(roomId).emit('ROOM_MESSAGE_BROADCAST', message);
  });

  socket.on('SEND_ROOM_GIFT', ({ roomId, gift, sender, targetName, targetCount }) => {
    io.to(roomId).emit('ROOM_GIFT_EXPLOSION', { gift, sender, targetName, targetCount });
    io.to(roomId).emit('ROOM_MESSAGE_BROADCAST', {
      id: `rmsg-${Date.now()}`,
      message_type: 'gift',
      sender,
      gift_data: gift,
      text: `أرسل ${gift?.name_ar || 'هدية'} ${gift?.icon || '🎁'} إلى ${targetName}! 🎉✨`,
    });
  });

  // 5. WebRTC Calling Signaling (1-to-1 and Room Mic)
  socket.on('CALL_USER', ({ targetUserId, caller, callType }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('INCOMING_CALL', { caller, callType });
    } else {
      socket.emit('CALL_USER_OFFLINE', { targetUserId });
    }
  });

  socket.on('CALL_ACCEPTED', ({ callerId, receiver }) => {
    const callerSocketId = userSocketMap.get(callerId);
    if (callerSocketId) io.to(callerSocketId).emit('CALL_CONNECTED', { receiver });
  });

  socket.on('CALL_REJECTED', ({ callerId }) => {
    const callerSocketId = userSocketMap.get(callerId);
    if (callerSocketId) io.to(callerSocketId).emit('CALL_DECLINED');
  });

  socket.on('CALL_ENDED', ({ targetUserId }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) io.to(targetSocketId).emit('CALL_TERMINATED');
  });

  socket.on('WEBRTC_OFFER', ({ targetUserId, sdp }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) io.to(targetSocketId).emit('WEBRTC_OFFER', { sdp, senderSocketId: socket.id });
  });

  socket.on('WEBRTC_ANSWER', ({ targetUserId, sdp }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) io.to(targetSocketId).emit('WEBRTC_ANSWER', { sdp });
  });

  socket.on('WEBRTC_ICE_CANDIDATE', ({ targetUserId, candidate }) => {
    const targetSocketId = userSocketMap.get(targetUserId);
    if (targetSocketId) io.to(targetSocketId).emit('WEBRTC_ICE_CANDIDATE', { candidate });
  });

  // 6. Disconnect
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      userSocketMap.delete(user.id);
      connectedUsers.delete(socket.id);
      io.emit('ONLINE_USERS_UPDATE', Array.from(connectedUsers.values()));
    }
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MingleUp Server running on port ${PORT}`);
});