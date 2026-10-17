import { mockDocuments } from "@/mocks/knowledge";
import { simulateLatency } from "@/services/config";
import type { DocumentFileType, KnowledgeDocument } from "@/types";

let documents: KnowledgeDocument[] = [...mockDocuments];

function inferFileType(fileName: string): DocumentFileType {
  const ext = fileName.split(".").pop()?.toUpperCase();
  if (ext === "PDF") return "PDF";
  if (ext === "DOCX" || ext === "DOC") return "DOCX";
  if (ext === "TXT") return "TXT";
  if (ext === "MD") return "MD";
  if (ext === "CSV") return "CSV";
  if (ext === "HTML" || ext === "HTM") return "HTML";
  return "TXT";
}

export const knowledgeService = {
  async getAll(): Promise<KnowledgeDocument[]> {
    await simulateLatency();
    return [...documents].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  async upload(file: { name: string; size: number }): Promise<KnowledgeDocument> {
    await simulateLatency(600);
    const doc: KnowledgeDocument = {
      id: `doc_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      fileType: inferFileType(file.name),
      fileSizeBytes: file.size,
      status: "PROCESSING",
      uploadedAt: new Date().toISOString(),
      chunkCount: 0,
      uploadedBy: "Você",
      linkedAgentIds: [],
    };
    documents = [doc, ...documents];

    // Simulate async background processing.
    setTimeout(() => {
      const succeeds = Math.random() > 0.15;
      documents = documents.map((d) =>
        d.id === doc.id
          ? succeeds
            ? {
                ...d,
                status: "PROCESSED",
                processedAt: new Date().toISOString(),
                chunkCount: Math.floor(20 + Math.random() * 180),
              }
            : { ...d, status: "ERROR", errorMessage: "Não foi possível processar o documento: formato não suportado ou arquivo corrompido." }
          : d
      );
    }, 4000 + Math.random() * 2000);

    return doc;
  },

  async delete(id: string): Promise<void> {
    await simulateLatency(300);
    documents = documents.filter((d) => d.id !== id);
  },

  async reprocess(id: string): Promise<void> {
    await simulateLatency(300);
    documents = documents.map((d) => (d.id === id ? { ...d, status: "PROCESSING", errorMessage: undefined } : d));
    setTimeout(() => {
      documents = documents.map((d) =>
        d.id === id
          ? { ...d, status: "PROCESSED", processedAt: new Date().toISOString(), chunkCount: Math.floor(20 + Math.random() * 180) }
          : d
      );
    }, 3500);
  },
};
