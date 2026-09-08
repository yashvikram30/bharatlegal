import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILegalDraft extends Document {
  userId: mongoose.Types.ObjectId;
  draftType: string;
  title: string;
  formData: Record<string, any>;
  generatedContent: string;
  createdAt: Date;
  updatedAt: Date;
}

const LegalDraftSchema = new Schema<ILegalDraft>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    draftType: {
      type: String,
      required: [true, "Draft type is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    formData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    generatedContent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const LegalDraftModel: Model<ILegalDraft> =
  mongoose.models.LegalDraft ||
  mongoose.model<ILegalDraft>("LegalDraft", LegalDraftSchema);

export default LegalDraftModel;
