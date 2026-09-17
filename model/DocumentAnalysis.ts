import mongoose, { Schema, Document, Model } from "mongoose";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface IRiskyClause {
  clauseTitle: string;
  clauseText: string;
  riskLevel: RiskLevel;
  explanation: string;
  recommendation: string;
  statutoryReference?: string;
}

export interface IStatutoryReference {
  act: string;
  section: string;
  title: string;
  relevance: string;
  actSlug?: string;
}

export interface IDocumentAnalysis extends Document {
  userId?: mongoose.Types.ObjectId;
  matterId?: mongoose.Types.ObjectId | null;
  fileName: string;
  fileType: "PDF" | "DOCX" | "TXT" | "OTHER";
  fileSize: number;
  documentCategory: string;
  parties: string[];
  riskScore: number;
  executiveSummary: string;
  keyObligations: string[];
  actionChecklist: string[];
  riskyClauses: IRiskyClause[];
  statutoryReferences: IStatutoryReference[];
  simplifiedText: string;
  originalText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiskyClauseSchema = new Schema<IRiskyClause>(
  {
    clauseTitle: { type: String, required: true, default: "Potentially Problematic Provision" },
    clauseText: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
      default: "medium",
    },
    explanation: { type: String, required: true },
    recommendation: { type: String, default: "" },
    statutoryReference: { type: String, default: "" },
  },
  { _id: false }
);

const StatutoryReferenceSchema = new Schema<IStatutoryReference>(
  {
    act: { type: String, required: true },
    section: { type: String, required: true },
    title: { type: String, required: true },
    relevance: { type: String, required: true },
    actSlug: { type: String, default: "" },
  },
  { _id: false }
);

const DocumentAnalysisSchema = new Schema<IDocumentAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    matterId: {
      type: Schema.Types.ObjectId,
      ref: "Matter",
      default: null,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    fileType: {
      type: String,
      enum: ["PDF", "DOCX", "TXT", "OTHER"],
      default: "PDF",
    },
    fileSize: {
      type: Number,
      required: true,
    },
    documentCategory: {
      type: String,
      default: "General Legal Agreement",
    },
    parties: {
      type: [String],
      default: [],
    },
    riskScore: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    keyObligations: {
      type: [String],
      default: [],
    },
    actionChecklist: {
      type: [String],
      default: [],
    },
    riskyClauses: {
      type: [RiskyClauseSchema],
      default: [],
    },
    statutoryReferences: {
      type: [StatutoryReferenceSchema],
      default: [],
    },
    simplifiedText: {
      type: String,
      required: true,
    },
    originalText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

DocumentAnalysisSchema.index({ userId: 1, createdAt: -1 });

const DocumentAnalysisModel: Model<IDocumentAnalysis> =
  mongoose.models.DocumentAnalysis ||
  mongoose.model<IDocumentAnalysis>("DocumentAnalysis", DocumentAnalysisSchema);

export default DocumentAnalysisModel;
