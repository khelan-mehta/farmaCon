import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Param,
  NotFoundException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { LoggerService } from '../../services/logger.service';
import { JwtAuthGuard } from '../../jwt-auth.guard'; // Import the guard
import { GmService } from 'src/services/gm/gm.service';

const client = new OAuth2Client(
  '466091079940-bhglgc0ggj1de0nu9uccc1ecf2u8no16.apps.googleusercontent.com',
);

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController'); // Initialize logger

  constructor(
    private readonly gmService: GmService,
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {}
  @Post('verify-token')
  async verifyToken(@Body('token') token: string, @Res() res: Response) {
    try {
      const decodedToken = await this.authService.verifyToken(token);
      return res.status(HttpStatus.OK).json({
        message: 'Token is valid',
        decodedToken,
      });
    } catch (error) {
      this.logger.error('Token verification failed', error.stack);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid or expired token',
      });
    }
  }
  // Example of how to use the guard for protected routes
  @UseGuards(JwtAuthGuard)
  @Get('protected-route')
  async protectedRoute(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      message: 'You have access to this protected route',
    });
  }

  @Post('register')
  async register(@Body() body, @Res() res: Response) {
    this.loggerService.log('Register endpoint hit');
    const { name, email, password } = body;
    try {
      const user = await this.authService.register(name, email, password);
      this.loggerService.log('User registered successfully');
      return res.status(HttpStatus.CREATED).json(user);
    } catch (error) {
      this.loggerService.error('Error during registration', error.message);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.message });
    }
  }

  @Post('register-gm')
  // @UseGuards(JwtAuthGuard) // Ensure only authenticated users can register GMs
  async registerGM(@Body() body, @Res() res: Response) {
    this.loggerService.log('Register GM endpoint hit');
    const { name, email, password } = body;
    try {
      const gm = await this.authService.registerGM(name, email, password);
      this.loggerService.log('GM registered successfully');
      return res.status(HttpStatus.CREATED).json(gm);
    } catch (error) {
      this.loggerService.error('Error during GM registration', error.message);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.message });
    }
  }
  @Post('register-retailer')
  async registerRetailer(@Body() body, @Res() res: Response) {
    this.loggerService.log('Register Retailer endpoint hit');
    try {
      const retailer = await this.authService.registerRetailer(body);
      this.loggerService.log('Retailer registered successfully');
      return res.status(HttpStatus.CREATED).json(retailer);
    } catch (error) {
      this.loggerService.error(
        'Error during retailer registration',
        error.message,
      );
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: error.message });
    }
  }

  @Post('login')
  async login(@Body() body, @Res() res: Response) {
    const { email, password } = body;
    this.loggerService.log(`Login attempt for email: ${email}`);

    try {
      const user = await this.authService.validateUser(email, password);
      const gm = await this.authService.validateGM(email, password);

      if (!user && !gm) {
        this.loggerService.warn(`Invalid login attempt for email: ${email}`);
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid credentials' });
      }

      const tokens = user
        ? await this.authService.login(user)
        : await this.authService.login(gm);

      res.cookie('access_token', tokens.accessToken, { httpOnly: true });
      res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });
      this.loggerService.log(`Login successful for email: ${email}`);
      return res.json(tokens).status(HttpStatus.CREATED);
    } catch (error) {
      this.loggerService.error('Error during login', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
  @Post('gm/login')
  async gmLogin(@Body() body, @Res() res: Response) {
    const { email, password } = body;
    try {
      const gm = await this.authService.validateGM(email, password);
      if (!gm) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid GM credentials' });
      }

      if (!gm.isVerified) {
        // GM is not verified, return appropriate response
        return res.status(201).json({
          isVerified: gm.isVerified,
          message: 'GM account is not verified',
        });
      }

      const tokens = await this.authService.login(gm);
      res.cookie('access_token', tokens.accessToken, { httpOnly: true });
      res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });

      return res.status(HttpStatus.CREATED).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        id: gm.id,
        name: gm.name,
        isVerified: gm.isVerified,
      });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
  @Post('retailer/login')
  async retailerLogin(@Body() body, @Res() res: Response) {
    const { email, password } = body;
    this.loggerService.log(`Retailer login attempt for email: ${email}`);
    try {
      const retailer = await this.authService.validateRetailer(email, password);
      if (!retailer) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: 'Invalid retailer credentials' });
      }
      const tokens = await this.authService.login(retailer);
      res.cookie('access_token', tokens.accessToken, { httpOnly: true });
      res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });
      this.loggerService.log(`Retailer login successful for email: ${email}`);
      this.loggerService.log(
        `Retailer login successful for name: ${retailer.ownerName.first}`,
      );

      // return res.json(tokens).status(HttpStatus.CREATED);
      return res.status(HttpStatus.CREATED).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        id: tokens.id,
        firmname: retailer.firmName,
        ownerName: {
          first: retailer.ownerName.first,
          last: retailer.ownerName.last,
        },
      });
    } catch (error) {
      this.loggerService.error('Error during retailer login', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  @Post('google')
  async googleLogin(@Body() body, @Res() res: Response) {
    const { token } = body;
    this.loggerService.log('Google login attempt');
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience:
          '466091079940-bhglgc0ggj1de0nu9uccc1ecf2u8no16.apps.googleusercontent.com',
      });
      const payload = ticket.getPayload();
      const googleId = payload['sub'];
      const email = payload['email'];
      const user = await this.authService.googleLogin(googleId, email);
      const tokens = await this.authService.login(user);
      res.cookie('access_token', tokens.accessToken, { httpOnly: true });
      res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });
      this.loggerService.log('Google login successful');
      return res.json(tokens);
    } catch (error) {
      this.loggerService.error('Error during Google login', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  @Post('refresh')
  async refreshToken(@Body() body, @Res() res: Response) {
    const { token } = body;
    this.loggerService.log('Token refresh attempt');
    try {
      const newTokens = await this.authService.refreshToken(token);
      res.cookie('access_token', newTokens.accessToken, { httpOnly: true });
      this.loggerService.log('Token refresh successful');
      return res.json(newTokens);
    } catch (error) {
      this.loggerService.error('Error during token refresh', error.message);
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid token' });
    }
  }

  @Get()
  async getUsers(@Res() res: Response) {
    this.loggerService.log('Fetching all users');
    try {
      const users = await this.authService.getUsers();
      this.loggerService.log('Fetched all users successfully');
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      this.loggerService.error('Error fetching users', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  @Get('id/:id')
  async getUserById(@Param('id') id: string, @Res() res: Response) {
    this.loggerService.log(`Fetching user by ID: ${id}`);
    try {
      const user = await this.authService.getUserById(id);
      if (!user) {
        this.loggerService.warn(`User not found with ID: ${id}`);
        throw new NotFoundException('User not found');
      }
      this.loggerService.log(`Fetched user by ID: ${id} successfully`);
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      this.loggerService.error(
        `Error fetching user by ID: ${id}`,
        error.message,
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  @Get('name/:name')
  async getUserByName(@Param('name') name: string, @Res() res: Response) {
    this.loggerService.log(`Fetching users by name: ${name}`);
    try {
      const users = await this.authService.getUserByName(name);
      if (!users.length) {
        this.loggerService.warn(`No users found with the given name: ${name}`);
        throw new NotFoundException('No users found with the given name');
      }
      this.loggerService.log(`Fetched users by name: ${name} successfully`);
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      this.loggerService.error(
        `Error fetching users by name: ${name}`,
        error.message,
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string, @Res() res: Response) {
    this.loggerService.log(`Fetching user by email: ${email}`);
    try {
      const user = await this.authService.getUserByEmail(email);
      if (!user) {
        this.loggerService.warn(`User not found with email: ${email}`);
        throw new NotFoundException('User not found');
      }
      this.loggerService.log(`Fetched user by email: ${email} successfully`);
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      this.loggerService.error(
        `Error fetching user by email: ${email}`,
        error.message,
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  @Get('verified-users')
  async getVerifiedUsers(@Res() res: Response) {
    this.loggerService.log('Fetching verified users');
    try {
      const users = await this.authService.getVerifiedUsers();
      this.loggerService.log('Fetched verified users successfully');
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      this.loggerService.error('Error fetching verified users', error.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  @Get('non-verified-users')
  async getNonVerifiedUsers(@Res() res: Response) {
    this.loggerService.log('Fetching non-verified users');
    try {
      const users = await this.authService.getNonVerifiedUsers();
      this.loggerService.log('Fetched non-verified users successfully');
      return res.status(HttpStatus.OK).json(users);
    } catch (error) {
      this.loggerService.error(
        'Error fetching non-verified users',
        error.message,
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
}
