export const currentUser = {
  id: 1,
  name: "You",
};

export const users = [
  {
    id: 2,
    name: "Ali",
    email: "ali@gmail.com",
    online: true,
  },
  {
    id: 3,
    name: "Ahmed",
    email: "ahmed@gmail.com",
    online: false,
  },
];

export const conversations = [
  {
    id: 1,
    participants: [1, 2],
    lastMessage: "Hello 👋",
    unreadCount: { 1: 0, 2: 2 },
    isFavorite: true,
    updatedAt: Date.now(),
  },
];

export const messages = [
  {
    id: 1,
    conversationId: 1,
    senderId: 2,
    text: "Hello 👋",
    createdAt: Date.now(),
  },
];