export interface Document {
  id: string;
  userId: string;
  type: 'passport' | 'id_card' | 'driving_license' | 'visa' | 'other';
  documentNumber: string;
  issuingCountry?: string;
  issueDate: Date;
  expiryDate: Date;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentDto {
  type: 'passport' | 'id_card' | 'driving_license' | 'visa' | 'other';
  documentNumber: string;
  issuingCountry?: string;
  issueDate: Date | string;
  expiryDate: Date | string;
  file: File;
}

export interface UpdateDocumentDto extends Partial<Omit<CreateDocumentDto, 'file'>> {
  isVerified?: boolean;
  verificationNotes?: string;
}

export interface DocumentVerificationDto {
  isVerified: boolean;
  verificationNotes?: string;
}
