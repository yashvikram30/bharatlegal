import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
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
    title: {
      type: String,
      required: true,
      default: "New consultation",
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
