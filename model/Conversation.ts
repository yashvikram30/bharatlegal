import mongoose, { Schema, Document, Model } from "mongoose";

export const DEFAULT_CONVERSATION_TITLE = "New consultation";

/** "chat" is a normal AI consultation. "matter-assistant" is the private thread with a matter's assistant. */
export type ConversationKind = "chat" | "matter-assistant";
/** Mongo filter that leaves the assistant's private threads out of chat lists. */
export const REGULAR_CHATS = { kind: { $ne: "matter-assistant" } } as const;

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  matterId?: mongoose.Types.ObjectId | null;
  kind?: ConversationKind;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    matterId: {
      type: Schema.Types.ObjectId,
      ref: "Matter",
      default: null,
      index: true,
    },
    kind: {
      type: String,
      enum: ["chat", "matter-assistant"],
      default: "chat",
    },
    title: {
      type: String,
      required: true,
      default: DEFAULT_CONVERSATION_TITLE,
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance timeline sort index
ConversationSchema.index({ userId: 1, updatedAt: -1 });

const ConversationModel: Model<IConversation> =
  (mongoose.models.Conversation as Model<IConversation>) ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default ConversationModel;
