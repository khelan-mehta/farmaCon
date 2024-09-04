export interface DesignCode {
  designId: string;
  designName: string;
  deviceId: string;
  isDeleted: boolean;
  password: string;
  token: string;
  isSuspended: boolean;
  isMaster: boolean;
  totalOrders: number;
  isPremium: boolean;
  images: string[]; // Array to store image URLs (maximum 2)
  description: string;
  fabricType: string;
  designCodePrice: number;
  category : string;
}