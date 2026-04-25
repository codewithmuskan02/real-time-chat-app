import { Schema, model, Document, Types } from "mongoose";

export interface IRoom extends Document {
  name: string;
  type: "direct" | "group";
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  avatar?: string;
  inviteCode?: string;
  lastMessage?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["direct", "group"], required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    avatar: { type: String },
    inviteCode: { type: String, index: true, unique: true, sparse: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

export const Room = model<IRoom>("Room", roomSchema);
