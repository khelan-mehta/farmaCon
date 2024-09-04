export interface Worker {
    mobileNo: number;
    workerName: {
      first: string;
      last: string;
    };
    deviceId: string;
    isDeleted: boolean;
    isVerified: boolean;
    password: string;
    token: string;
    isSuspended: boolean;
    isMaster: boolean;
    totalOrders: number;
  }
  