import mongoose, { Document, Model, Schema } from "mongoose";

export type MatterCategory = "General" | "Housing" | "Employment" | "Consumer" | "Criminal" | "Court Case" | "Family" | "Other";
export type MatterStatus = "Open" | "Waiting" | "Resolved";

export interface IMatterChecklistItem {
  text: string;
  completed: boolean;
}

export interface IMatter extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  category: MatterCategory;
  status: MatterStatus;
  summary: string;
  nextAction: string;
  nextActionDue?: Date | null;
  checklist: IMatterChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const MatterChecklistItemSchema = new Schema<IMatterChecklistItem>(
  {
    text: { type: String, required: true, trim: true, maxlength: 500 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const MatterSchema = new Schema<IMatter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    category: {
      type: String,
      enum: ["General", "Housing", "Employment", "Consumer", "Criminal", "Court Case", "Family", "Other"],
      default: "General",
    },
    status: { type: String, enum: ["Open", "Waiting", "Resolved"], default: "Open", index: true },
    summary: { type: String, default: "", trim: true, maxlength: 3000 },
    nextAction: { type: String, default: "Decide your next step", trim: true, maxlength: 500 },
    nextActionDue: { type: Date, default: null },
    checklist: { type: [MatterChecklistItemSchema], default: [] },
  },
  { timestamps: true }
);

MatterSchema.index({ userId: 1, status: 1, updatedAt: -1 });

const MatterModel: Model<IMatter> =
  (mongoose.models.Matter as Model<IMatter>) || mongoose.model<IMatter>("Matter", MatterSchema);

export default MatterModel;
