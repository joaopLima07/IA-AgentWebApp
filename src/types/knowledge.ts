export type DocumentStatus = "PROCESSING" | "PROCESSED" | "ERROR";

export type DocumentFileType = "PDF" | "DOCX" | "TXT" | "MD" | "CSV" | "HTML";

export interface KnowledgeDocument {
  id: string;
  name: string;
  fileType: DocumentFileType;
  fileSizeBytes: number;
  status: DocumentStatus;
  uploadedAt: string;
  processedAt?: string;
  chunkCount: number;
  uploadedBy: string;
  errorMessage?: string;
  linkedAgentIds: string[];
}
