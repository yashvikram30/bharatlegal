import mongoose, { Schema, Document, Model } from "mongoose";

export type CaseType =
  | "Civil"
  | "Criminal"
  | "Consumer"
  | "Labour"
  | "Family"
  | "Tenancy"
  | "RTI"
  | "Corporate"
  | "Insolvency"
  | "Intellectual Property"
  | "Constitutional"
  | "Other";

export type CaseStatus =
  | "active"
  | "pending_hearing"
  | "reserved_for_order"
  | "disposed"
  | "appealed";

export interface ICaseTimelineEvent {
  date: Date;
  title: string;
  description: string;
  documentUrl?: string;
}

export interface ICase extends Document {
  userId: mongoose.Types.ObjectId;
  caseNumber: string;
  title: string;
  court: string;
  caseType: CaseType;
  status: CaseStatus;
  filingDate?: Date;
  nextHearingDate?: Date;
  opponentName?: string;
  judgeName?: string;
  timeline: ICaseTimelineEvent[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema<ICaseTimelineEvent>(
  {
    date: { type: Date, required: true, default: Date.now },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    documentUrl: { type: String, default: null },
  },
  { _id: false }
);

const CaseSchema = new Schema<ICase>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    caseNumber: {
      type: String,
      required: [true, "Case number / CNR is required"],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Case title is required"],
      trim: true,
    },
    court: {
      type: String,
      required: [true, "Court / Forum name is required"],
      trim: true,
    },
    caseType: {
      type: String,
      enum: [
        "Civil",
        "Criminal",
        "Consumer",
        "Labour",
        "Family",
        "Tenancy",
        "RTI",
        "Corporate",
        "Insolvency",
        "Intellectual Property",
        "Constitutional",
        "Other",
      ],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["active", "pending_hearing", "reserved_for_order", "disposed", "appealed"],
      default: "active",
      index: true,
    },
    filingDate: {
      type: Date,
      default: null,
    },
    nextHearingDate: {
      type: Date,
      default: null,
      index: true,
    },
    opponentName: {
      type: String,
      default: null,
      trim: true,
    },
    judgeName: {
      type: String,
      default: null,
      trim: true,
    },
    timeline: {
      type: [TimelineEventSchema],
      default: [],
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const CaseModel: Model<ICase> =
  mongoose.models.Case || mongoose.model<ICase>("Case", CaseSchema);

export default CaseModel;
