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
  readonly email: string; // Added email field
  readonly outstandingBalance? : number;
}
