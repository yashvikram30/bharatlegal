import mongoose, { Schema, Document, Model } from "mongoose";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface IRiskyClause {
  clauseText: string;
  riskLevel: RiskLevel;
  explanation: string;
  recommendation?: string;
}

export interface IDocumentAnalysis extends Document {
  userId?: mongoose.Types.ObjectId;
  fileName: string;
  fileType: "PDF" | "DOCX" | "TXT" | "OTHER";
  fileSize: number;
  documentCategory: string;
  executiveSummary: string;
  keyObligations: string[];
  riskyClauses: IRiskyClause[];
  simplifiedText: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiskyClauseSchema = new Schema<IRiskyClause>(
  {
    clauseText: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
      default: "medium",
    },
    explanation: { type: String, required: true },
    recommendation: { type: String, default: "" },
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
      default: "General Legal Document",
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    keyObligations: {
      type: [String],
      default: [],
    },
    riskyClauses: {
      type: [RiskyClauseSchema],
      default: [],
    },
    simplifiedText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DocumentAnalysisModel: Model<IDocumentAnalysis> =
  mongoose.models.DocumentAnalysis ||
  mongoose.model<IDocumentAnalysis>("DocumentAnalysis", DocumentAnalysisSchema);

export default DocumentAnalysisModel;
