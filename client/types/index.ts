export type MessageType = "text" | "image" | "file";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Message {
  _id: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  sender: User;
  room: string;
  readBy: string[];
  createdAt: string;
}

export interface Room {
  _id: string;
  name: string;
  type: "direct" | "group";
  members: User[];
  admins: string[];
  avatar?: string;
  inviteCode?: string;
  lastMessage?: Message;
  unreadCount?: number;
}
