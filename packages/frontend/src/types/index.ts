// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
  wallet?: Wallet;
  loyaltyPoints?: number;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  STAFF_FINANCE = 'STAFF_FINANCE',
  STAFF_SUPPORT = 'STAFF_SUPPORT',
  STAFF_OPERATIONS = 'STAFF_OPERATIONS',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface UserPreferences {
  language: 'en' | 'bn' | 'ar';
  currency: 'USD' | 'BDT' | 'SAR';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  travelPreferences: {
    seatPreference?: 'aisle' | 'window' | 'middle';
    mealPreference?: string;
    specialAssistance?: string[];
  };
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  reference?: string;
  createdAt: string;
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  type: BookingType;
  status: BookingStatus;
  reference: string;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  details: FlightBooking | HotelBooking | PackageBooking;
  payments: Payment[];
  documents: Document[];
}

export enum BookingType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  PACKAGE = 'PACKAGE',
  HAJJ = 'HAJJ',
  UMRAH = 'UMRAH',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Flight Types
export interface FlightBooking {
  flights: Flight[];
  passengers: Passenger[];
  totalPrice: number;
  currency: string;
  pnr?: string;
  ticketNumbers?: string[];
}

export interface Flight {
  id: string;
  airline: Airline;
  flightNumber: string;
  departure: Airport;
  arrival: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  aircraft: string;
  class: FlightClass;
  price: number;
  currency: string;
  availableSeats: number;
  baggage: BaggageInfo;
  stops: FlightStop[];
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export enum FlightClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

export interface BaggageInfo {
  cabin: string;
  checked: string;
}

export interface FlightStop {
  airport: Airport;
  duration: number;
}

export interface Passenger {
  id?: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  seatNumber?: string;
  specialRequests?: string[];
}

// Hotel Types
export interface HotelBooking {
  hotel: Hotel;
  rooms: HotelRoom[];
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: HotelGuest[];
  totalPrice: number;
  currency: string;
  confirmationNumber?: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: Address;
  rating: number;
  images: string[];
  amenities: string[];
  policies: HotelPolicies;
  contact: ContactInfo;
}

export interface HotelRoom {
  id: string;
  type: string;
  description: string;
  maxOccupancy: number;
  bedType: string;
  amenities: string[];
  price: number;
  currency: string;
  images: string[];
}

export interface HotelGuest {
  firstName: string;
  lastName: string;
  age?: number;
}

export interface HotelPolicies {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  children: string;
  pets: string;
}

// Package Types
export interface PackageBooking {
  package: TravelPackage;
  travelers: Traveler[];
  customizations?: PackageCustomization[];
  totalPrice: number;
  currency: string;
  installmentPlan?: InstallmentPlan;
}

export interface TravelPackage {
  id: string;
  name: string;
  description: string;
  type: PackageType;
  duration: number;
  destinations: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  price: PackagePrice;
  images: string[];
  availability: PackageAvailability;
  terms: string;
}

export enum PackageType {
  STANDARD = 'STANDARD',
  LUXURY = 'LUXURY',
  BUDGET = 'BUDGET',
  HAJJ = 'HAJJ',
  UMRAH = 'UMRAH',
  FAMILY = 'FAMILY',
  HONEYMOON = 'HONEYMOON',
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation?: string;
}

export interface PackagePrice {
  basePrice: number;
  currency: string;
  pricePerPerson: boolean;
  discounts?: Discount[];
}

export interface PackageAvailability {
  startDate: string;
  endDate: string;
  maxTravelers: number;
  availableSlots: number;
}

export interface Traveler {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
  visaRequired: boolean;
  specialRequirements?: string[];
}

export interface PackageCustomization {
  type: string;
  description: string;
  price: number;
  currency: string;
}

export interface InstallmentPlan {
  totalAmount: number;
  installments: Installment[];
  currency: string;
}

export interface Installment {
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidAt?: string;
}

// Payment Types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  gateway: PaymentGateway;
  status: PaymentStatus;
  reference?: string;
  gatewayResponse?: any;
  createdAt: string;
  processedAt?: string;
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_BANKING = 'MOBILE_BANKING',
  WALLET = 'WALLET',
  CASH = 'CASH',
}

export enum PaymentGateway {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  SSLCOMMERZ = 'SSLCOMMERZ',
  HYPERPAY = 'HYPERPAY',
  PAYTABS = 'PAYTABS',
}

// Common Types
export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadedAt: string;
  expiresAt?: string;
}

export enum DocumentType {
  PASSPORT = 'PASSPORT',
  VISA = 'VISA',
  ID_CARD = 'ID_CARD',
  TICKET = 'TICKET',
  VOUCHER = 'VOUCHER',
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
}

export interface Discount {
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  description: string;
  validFrom?: string;
  validTo?: string;
  conditions?: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface SearchFilters {
  [key: string]: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface NewsletterSubscription {
  email: string;
  preferences?: {
    deals: boolean;
    news: boolean;
    packages: boolean;
  };
}
