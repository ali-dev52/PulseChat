export const users = [
  { id: 1, name: "Ali", email: "ali@gmail.com", online: true },
  { id: 2, name: "Ahmed", email: "ahmed@gmail.com", online: false },
  { id: 2, name: "Ahmed", email: "ahmed@gmail.com", online: false },
  { id: 2, name: "Ahmed", email: "ahmed@gmail.com", online: false },
  { id: 2, name: "Ahmed", email: "ahmed@gmail.com", online: false },
];

export const conversations = [
  {
    id: 1,
    participants: [0, 1],
    lastMessage: "Hello 👋",
    unreadCount: { 0: 0, 1: 2 },
    isFavorite: true,
    updatedAt: Date.now(),
  },
    {id: 2,
    participants: [0, 1],
    lastMessage: "How are you 👋",
    unreadCount: { 0: 0, 1: 2 },
    isFavorite: true,
    updatedAt: Date.now(),
  },
    {id: 3,
    participants: [0, 1],
    lastMessage: "Hi",
    unreadCount: { 0: 0, 1: 2 },
    isFavorite: true,
    updatedAt: Date.now(),
  }
];

export const messages = [
  { id: 1, conversationId: 1, senderId: 1, text: "Hello 👋", seen: false, createdAt: Date.now() },
];