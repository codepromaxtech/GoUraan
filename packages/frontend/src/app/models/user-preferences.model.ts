export interface UserPreferences {
  id: string;
  userId: string;
  language: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  seatPreference?: 'window' | 'aisle' | 'middle';
  mealPreference?: string;
  specialAssistance: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPreferencesDto {
  language?: string;
  currency?: string;
  timezone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  seatPreference?: 'window' | 'aisle' | 'middle';
  mealPreference?: string;
  specialAssistance?: string[];
}
