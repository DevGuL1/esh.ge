export interface BriefSection {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  amenities: string[];
  image: string;
}

export interface Booking {
  id: string;
  guestName: string;
  guestPhone: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'Pending' | 'Approved' | 'Declined';
  createdAt: string;
}

export interface SMSLog {
  id: string;
  recipient: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Failed';
}

export interface SyncLog {
  id: string;
  platform: 'Booking.com' | 'Airbnb' | 'Expedia' | 'Direct';
  event: string;
  timestamp: string;
  type: 'Inbound' | 'Outbound';
}

export interface SEOState {
  title: string;
  description: string;
  keywords: string;
  googleBusinessName: string;
  googleBusinessRating: number;
  googleBusinessReviews: number;
  googleBusinessLocation: string;
}

export interface DomainCheckResult {
  domainName: string;
  isAvailable: boolean;
  price: number;
  provider: string;
  suffix: string;
}
