export interface AgentProfile {
  id: string;
  userId: string;
  companyName: string;
  companyRegistrationNumber: string;
  taxId?: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  website?: string;
  commissionRate: number;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAgentProfileDto {
  companyName: string;
  companyRegistrationNumber: string;
  taxId?: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  website?: string;
  commissionRate?: number;
}

export interface UpdateAgentProfileDto extends Partial<CreateAgentProfileDto> {}

export interface AgentProfileVerificationDto {
  isVerified: boolean;
  verificationNotes?: string;
}
