import { Schema, model, Document, Types } from "mongoose";

export type MessageType = "text" | "image" | "file";

export interface IMessage extends Document {
  content: string;
  type: MessageType;
  fileUrl?: string;
  sender: Types.ObjectId;
  room: Types.ObjectId;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: { type: String, default: "" },
    type: { type: String, enum: ["text", "image", "file"], required: true },
    fileUrl: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true }
);

messageSchema.index({ room: 1, createdAt: -1 });

export const Message = model<IMessage>("Message", messageSchema);
