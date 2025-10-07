export type LoyaltyTransactionType = 
  | 'points_earned'
  | 'points_redeemed'
  | 'points_expired'
  | 'points_adjusted';

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: LoyaltyTransactionType;
  points: number;
  balance: number;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface LoyaltyBalance {
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
  expiredPoints: number;
  pointsExpiringSoon: number;
  nextExpirationDate?: Date;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  level: number;
  minPoints: number;
  benefits: string[];
  icon?: string;
  color?: string;
}

export interface UserLoyaltyStatus {
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier: number;
  progressPercentage: number;
  balance: LoyaltyBalance;
  recentTransactions: LoyaltyTransaction[];
}

export interface RedeemPointsDto {
  points: number;
  redemptionOption: string;
}
