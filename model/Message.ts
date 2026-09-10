import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessageSource {
  act: string;
  section: string;
  title?: string;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  sources?: IMessageSource[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSourceSchema = new Schema<IMessageSource>(
  {
    act: { type: String, required: true },
    section: { type: String, required: true },
    title: { type: String, default: "" },
  },
  { _id: false }
);

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: {
      type: [MessageSourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// High-performance chronological query index
MessageSchema.index({ conversationId: 1, createdAt: 1 });

const MessageModel: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) ||
  mongoose.model<IMessage>("Message", MessageSchema);

export default MessageModel;
