declare module "mammoth" {
  export interface ExtractionResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function extractRawText(input: { buffer: Buffer } | { path: string } | { arrayBuffer: ArrayBuffer }): Promise<ExtractionResult>;
  export function convertToHtml(input: { buffer: Buffer } | { path: string } | { arrayBuffer: ArrayBuffer }): Promise<ExtractionResult>;
}
