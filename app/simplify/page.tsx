"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  X,
  Copy,
  Download,
  Check,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";
import { simplifyTextLocally } from "@/lib/simplify";

const sampleRentAgreement = `RESIDENTIAL LEASE AGREEMENT
This Agreement is entered into on 1st day of January 2024 between Mr. Rajesh Sharma (Lessor/Landlord) and Ms. Ananya Sen (Lessee/Tenant).
1. PREMISES & TERM: The Landlord leases Flat No. 402, Greenview Apartments, Bengaluru for a term of 11 months commencing 01/01/2024.
2. RENT & DEPOSIT: Monthly rent shall be ₹28,000 payable on or before the 5th of every month. The Tenant has deposited an interest-free security deposit of ₹1,50,000.
3. LOCK-IN PERIOD & TERMINATION: Either party may terminate with 1 month notice. If Tenant vacates within the first 6 months lock-in period, the entire security deposit shall be forfeited unconditionally.
4. LANDLORD ACCESS: Landlord reserves the unrestricted right to enter and inspect the premises at any time without prior notice.
5. MAINTENANCE & REPAIRS: All structural, plumbing, and electrical repairs exceeding ₹500 shall be borne solely by the Tenant.
6. DISPUTE RESOLUTION: All disputes shall be subject to exclusive jurisdiction of Bengaluru courts.`;

const sampleEmploymentAgreement = `EMPLOYMENT CONTRACT & NON-DISCLOSURE
1. APPOINTMENT: The Company appoints the Employee as Senior Analyst with effect from 15th February 2024.
2. PROBATION & NOTICE: The Employee shall be on 6 months probation. During probation, notice period is 15 days; thereafter, 3 months written notice or salary in lieu thereof.
3. NON-COMPETE RESTRICTION: The Employee expressly covenants that for a period of 2 years post-termination, they shall not directly or indirectly work for, consult, or establish any business competing with the Company anywhere in India.
4. INTELLECTUAL PROPERTY: All works, inventions, designs, and developments authored during employment vest exclusively in the Company.
5. LIQUIDATED DAMAGES: Breach of confidentiality or early departure without serving full notice incurs liquidated damages equal to 6 months gross CTC.`;

export default function SimplifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [simplifiedContent, setSimplifiedContent] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("simplified");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile: File) => {
    const validTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith(".txt")) {
      toast.error("Please upload a PDF, Word, or plain text file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB size limit.");
      return;
    }

    setFile(selectedFile);
    setSimplifiedContent(null);
    setIsProcessing(true);
    setProgress(25);

    try {
      if (selectedFile.type === "text/plain" || selectedFile.name.endsWith(".txt")) {
        const text = await selectedFile.text();
        setOriginalContent(text);
      } else {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch("/api/extract-pdf", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setOriginalContent(data.text || "");
        } else {
          // Fallback text reading
          const text = await selectedFile.text();
          setOriginalContent(text);
        }
      }
      setProgress(100);
      toast.success("Document loaded. Click 'Simplify Document' to analyze.");
    } catch (error) {
      console.error("File reading error:", error);
      toast.error("Error extracting text from file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (sampleText: string, name: string) => {
    setFile(new File([sampleText], name, { type: "text/plain" }));
    setOriginalContent(sampleText);
    setSimplifiedContent(null);
    toast.success(`Loaded ${name}`);
  };

  const handleSimplify = async () => {
    if (!originalContent.trim()) {
      toast.error("No document text to simplify.");
      return;
    }

    setIsProcessing(true);
    setProgress(20);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 200);

      const result = await simplifyTextLocally(originalContent);
      clearInterval(interval);
      setSimplifiedContent(result);
      setProgress(100);
      setActiveTab("simplified");
      toast.success("Document analysis complete!");
    } catch (error) {
      console.error("Simplification error:", error);
      toast.error("Failed to simplify document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setOriginalContent("");
    setSimplifiedContent(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20">
          <FileText className="w-3.5 h-3.5" />
          <span>Zero-Retention Document Analysis</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground font-heading tracking-tight">
          Legal Document Simplifier
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Upload residential leases, employment contracts, NDAs, or court notices. Receive clear executive summaries, identified obligations, and flagged risky clauses.
        </p>
      </div>

      {/* Upload Zone & Sample Loaders */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: How It Works & Sample Buttons */}
        <div className="md:col-span-5 space-y-4">
          <Card className="border-border bg-card shadow-rest-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How It Works</CardTitle>
              <CardDescription>
                Zero permanent document storage. In-memory processing only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-foreground">Upload Document</p>
                  <p className="text-muted-foreground text-xs">
                    Drop PDF, Word, or plain text up to 10MB.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-foreground">AI Clause Detection</p>
                  <p className="text-muted-foreground text-xs">
                    Extracts obligations, lock-in terms, and penal clauses.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-foreground">Plain Language Breakdown</p>
                  <p className="text-muted-foreground text-xs">
                    Structured summary and risk assessment you can export.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Loaders */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Or Try A Sample Document:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  handleLoadSample(sampleRentAgreement, "Sample_Rent_Agreement.txt")
                }
                className="text-left p-2.5 rounded-lg border border-border bg-card hover:border-forest-500 hover:bg-forest-100/50 dark:hover:bg-forest-800/40 text-xs text-foreground transition-colors flex items-center justify-between"
              >
                <span>🏠 Sample Residential Lease Deed</span>
                <span className="text-[10px] text-muted-foreground font-mono">Load</span>
              </button>
              <button
                onClick={() =>
                  handleLoadSample(
                    sampleEmploymentAgreement,
                    "Sample_Employment_Contract.txt"
                  )
                }
                className="text-left p-2.5 rounded-lg border border-border bg-card hover:border-forest-500 hover:bg-forest-100/50 dark:hover:bg-forest-800/40 text-xs text-foreground transition-colors flex items-center justify-between"
              >
                <span>💼 Sample Employment Non-Compete</span>
                <span className="text-[10px] text-muted-foreground font-mono">Load</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Upload Dropzone Card */}
        <div className="md:col-span-7">
          <Card className="border-border bg-card shadow-rest-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Document Upload</CardTitle>
              <CardDescription>
                Supports PDF, DOCX, and TXT files (up to 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-forest-500 bg-forest-100/40 dark:bg-forest-800/40"
                      : "border-border hover:border-forest-500"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 flex items-center justify-center">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        Drag and drop your legal document, or{" "}
                        <label className="text-gold-700 dark:text-gold-500 hover:underline cursor-pointer">
                          browse files
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, Word, or plain text up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-xl">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="p-2 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • Text Ready
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>

                  <Button
                    className="w-full bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 font-medium h-11 focus-visible:ring-2 focus-visible:ring-gold-700"
                    onClick={handleSimplify}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Analyzing Document..." : "Simplify Document"}
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2 pt-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Extracting statutory clauses... {progress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Results View */}
      {simplifiedContent !== null && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-border bg-card shadow-rest-card">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <CardTitle className="text-xl">Document Analysis & Summary</CardTitle>
                <CardDescription>
                  Plain-language breakdown and statutory risk assessment
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(simplifiedContent)}
                  className="text-xs h-8 flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadText(simplifiedContent, "simplified_document_summary.txt")
                  }
                  className="text-xs h-8 flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Export Text
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-forest-100 dark:bg-forest-800 mb-4">
                  <TabsTrigger value="simplified">Simplified Explanation</TabsTrigger>
                  <TabsTrigger value="original">Original Text</TabsTrigger>
                </TabsList>

                <TabsContent value="simplified">
                  <div className="bg-background border border-border rounded-xl p-5 sm:p-6 prose prose-sm dark:prose-invert max-w-none prose-headings:font-heading prose-headings:text-foreground prose-strong:text-foreground">
                    {simplifiedContent.split("\n\n").map((para, i) => (
                      <p key={i} className="leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="original">
                  <div className="bg-background border border-border rounded-xl p-5 sm:p-6 max-h-[500px] overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                      {originalContent}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
