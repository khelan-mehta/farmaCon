// src/dto/interfaces/vegetable.interface.ts

export interface Vegetable {
  imageUrl: string;
  vegName: string;
  price: number;
  description: string;
  isVerified: boolean;
  farmerName: string;
  dateOfCreation: Date;
}
