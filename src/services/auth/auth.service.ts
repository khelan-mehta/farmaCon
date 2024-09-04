import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../dto/interfaces/user.interface'; // Adjust the path as needed
import { GM } from 'src/database/schemas/gm.schema'; // Adjust the path as needed
// import { RetailerSchema } from 'src/database/schemas/retailer.schema'; 
import { CreateRetailerDto, Retailer } from 'src/dto/interfaces/retailer.interface';
interface JwtPayload {
  email: string;
  sub: string;
}

@Injectable()
export class AuthService {
  private readonly refreshTokens: Map<string, string> = new Map();

  constructor(
    @InjectModel('User') // Ensure 'User' matches the name in your mongoose model
    private readonly userModel: Model<User>,
    @InjectModel('GM') // Ensure 'GM' matches the name in your mongoose model
    private readonly gmModel: Model<GM>,
    @InjectModel('Retailer') // Ensure 'Retailer' matches the name in your mongoose model
    private readonly retailerModel: Model<Retailer>,
        
    private readonly jwtService: JwtService,
  ) {
    console.log('Models Initialized:', {
      userModel: this.userModel.modelName,
      gmModel: this.gmModel.modelName,
      retailerModel: this.retailerModel.modelName,
    });
  }

  // User authentication
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }
    return null;
  }

  // // GM authentication
  // async validateGM(email: string, password: string): Promise<GM | null> {
  //   const gm = await this.gmModel.findOne({ email });

    // // if (gm && bcrypt.compareSync(password, gm.password)) {
    // //   return gm;
    // // }
    // if (gm && password === gm.password) { // Direct comparison
    //   return gm;
    // }
    // return null;
  // }
  async validateGM(email: string, password: string): Promise<GM | null> {
    const gm = await this.gmModel.findOne({ email });

    if (gm) {
      const isPasswordValid = await bcrypt.compare(password, gm.password);

      if (isPasswordValid) {
        return gm;
      }
    }

    return null;
  }
// Retailer authentication
// async validateRetailer(email: string, password: string): Promise<Retailer | null> {
//   const retailer = await this.retailerModel.findOne({ email });
//   console.log('Retailer from DB:', retailer);
//   console.log('Provided Password:', password);
//   console.log('Stored Password:', retailer ? retailer.password : null);

//   if (retailer && password === retailer.password) { // Direct comparison
//     console.log(retailer);
//     return retailer;
//   }
//   return null;
// }
async validateRetailer(
  email: string,
  password: string,
): Promise<Retailer | null> {
  try {
    // Find the retailer by email
    const retailer = await this.retailerModel.findOne({ email });

    // Log retailer information for debugging
    console.log('Retailer from DB:', retailer);
    console.log('Provided Password:', password);

    // Check if retailer exists and validate the password
    if (retailer && (await bcrypt.compare(password, retailer.password))) {
      console.log('Valid retailer:', retailer);
      return retailer;
    } else {
      console.log('Invalid credentials');
      return null;
    }
  } catch (error) {
    console.error('Error during retailer validation:', error);
    return null;
  }
}
  // User registration
  async register(name: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ name, email, password: hashedPassword });
    return newUser.save();
  }

  // GM registration
  async registerGM(name: string, email: string, password: string): Promise<GM> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newGM = new this.gmModel({ name, email, password: hashedPassword });
    return newGM.save();
  }
  // Retailer registration
  async registerRetailer(retailerData: CreateRetailerDto): Promise<Retailer> {
    const hashedPassword = await bcrypt.hash(retailerData.password, 10);
    const newRetailer = new this.retailerModel({ ...retailerData, password: hashedPassword });
    return newRetailer.save();
  }
  // Verify JWT token
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = this.jwtService.verify<JwtPayload>(token);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Generate refresh token
  generateRefreshToken(userId: string): string {
    const payload = { userId };
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  async login(user: User | GM | Retailer): Promise<{ accessToken: string; refreshToken: string; id: string }> {
    let payload: JwtPayload;
    let refreshToken: string;
    
    if ('email' in user && '_id' in user) {
      // This could be User, GM, or Retailer
      payload = { email: user.email, sub: user._id.toString() };
      refreshToken = this.generateRefreshToken(user._id.toString());
    } else {
      throw new Error('Invalid user type');
    }
  
    const accessToken = this.jwtService.sign(payload);
    this.refreshTokens.set(user._id.toString(), refreshToken);
  
    return { accessToken, refreshToken, id: user._id.toString() };
  }

  // Method to generate tokens for retailer
  async retailerLogin(retailer: Retailer): Promise<{ accessToken: string; refreshToken: string; id: string }> {
    const payload: JwtPayload = { email: retailer.email, sub: retailer._id.toString() };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(retailer._id.toString());
    this.refreshTokens.set(retailer._id.toString(), refreshToken);
    return { accessToken, refreshToken, id: retailer._id.toString() };
  }

  
  // Google login (for users)
  async googleLogin(googleId: string, email: string): Promise<User> {
    let user = await this.userModel.findOne({ googleId });

    if (!user) {
      user = await this.userModel.create({ email, googleId });
    }

    return user;
  }

  // Refresh access token
  async refreshToken(oldToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify(oldToken);
      const user = await this.userModel.findById(decoded.sub) || await this.gmModel.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      const newAccessToken = this.jwtService.sign({ email: user.email, sub: user._id.toString() });
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Get all users
  async getUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Get verified users
  async getVerifiedUsers(): Promise<User[]> {
    return this.userModel.find({ isVerified: true }).exec();
  }

  // Get non-verified users
  async getNonVerifiedUsers(): Promise<User[]> {
    return this.userModel.find({ isVerified: false }).exec();
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Get users by name
  async getUserByName(name: string): Promise<User[]> {
    const users = await this.userModel.find({ name: { $regex: name, $options: 'i' } }).exec();
    if (!users.length) {
      throw new NotFoundException('No users found with the given name');
    }
    return users;
  }

  
}
