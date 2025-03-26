export interface PDFOutput {
  id: string;
  type: string;
  createdAt: string;
  createdBy: string;
  signatureProvider: string | null;
  signed: boolean;
  documentName: string;
  size?: string;
  signedAt?: string | null;
  signedBy?: string | null;
  metadata?: Record<string, string>;
}