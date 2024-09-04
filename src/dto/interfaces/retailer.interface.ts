// src/dto/interfaces/retailer.interface.ts
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Retailer {
  _id: string; // Add this line to include _id
  retailerID: string;
  mobileNo: number;
  officeNo: number;
  firmName: string;
  ownerName: {
    first: string;
    last: string;
  };
  isVerified: boolean;
  deviceID: string;
  isDeleted: boolean;
  password: string;
  token: string;
  isSuspended: boolean;
  isPremium: boolean;
  address: Address; 
  email: string; 
  outstandingBalance: number;
}

export class CreateRetailerDto {
  readonly retailerID: string;
  readonly mobileNo: number;
  readonly officeNo: number;
  readonly firmName: string;
  readonly ownerName: {
    first: string;
    last: string;
  };
  readonly isVerified: boolean;
  readonly deviceID: string;
  readonly isDeleted: boolean;
  readonly password: string;
  readonly token: string;
  readonly isSuspended: boolean;
  readonly actType: string;  
  readonly address: Address; 
  readonly email: string;   
  readonly outstandingBalance? : number; 
}
