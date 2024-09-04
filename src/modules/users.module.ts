import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './database.module';
import { usersProviders } from '../services/user/users.provider';
import { AuthController } from 'src/controllers/auth/auth.controller';
import { OrderController } from 'src/controllers/orders/order.controller';
import { AppController } from 'src/controllers/app.controller';
import { AuthService } from 'src/services/auth/auth.service';
import { JwtStrategy } from '../services/auth/jwt.strategy';
import { AppService } from 'src/services/app.service';
import { jwtConstants } from './constants';
import OrderModel from 'src/database/models/order.model'; // Ensure correct path to OrderModel

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController, AppController, OrderController],
  providers: [AuthService, JwtStrategy, AppService, ...usersProviders, OrderModel],
})
export class UsersModule {}
