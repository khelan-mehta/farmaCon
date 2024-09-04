import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth/auth.service';
import { JwtStrategy } from './services/auth/jwt.strategy';
import { UploadService } from './services/upload.service';
import { AppController } from './controllers/app.controller';
import { OrderController } from './controllers/orders/order.controller';
import { LoggerService } from './services/logger.service';
import { PaginationService } from './services/pagination.service';
import { GmController } from './controllers/gm/gm.controller';
import { GmService } from './services/gm/gm.service';
import { AuthController } from './controllers/auth/auth.controller';
import { AppService } from './services/app.service';
import { HttpModule } from '@nestjs/axios';
import { jwtConstants } from './modules/constants';
import { UserSchema } from './database/schemas/user.schema';
import OrderModel from './database/models/order.model';
import { GMModel } from './database/models/gm.model';
import { RetailerModel } from './database/models/retailer.model';
import { RetailerService } from './services/retailer/retailer.service';
import { WorkerModule } from './worker.module'; // Import WorkerModule
import { RetailerModule } from './retailer.module';
import { WorkerModel } from './database/models/worker.model';
import { DesignCodeModule } from './design-code.module';
import { DesignCodeModel, DesignCodeSchema } from './database/models/designcode.model';
import { CatalogueModule } from './catalogue.module';
import { MailerService } from './services/mailer/mailer.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TransactionsController } from './controllers/gm/transactions.controller';
import { TransactionSchema } from './database/schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://khelan05:dXsHbmSERKGhXBya@farmaconnect.uvzvn.mongodb.net/?retryWrites=true&w=majority&appName=farmaConnect'),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Order', schema: OrderModel.schema },
      { name: 'GM', schema: GMModel.schema },
      { name: 'Retailer', schema: RetailerModel.schema },
      {name: 'Worker', schema: WorkerModel.schema},
      { name: 'DesignCode', schema: DesignCodeSchema },
      { name: 'Transactions', schema: TransactionSchema }
    ]),
    DesignCodeModule,
    CatalogueModule,
    PassportModule,
    WorkerModule, // Make sure WorkerModule is imported here
    RetailerModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
    HttpModule.register({}),
  ],
  controllers: [
    AppController,
    OrderController,
    GmController,
    AuthController,
    TransactionsController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    UploadService,
    AppService,
    LoggerService,
    PaginationService,
    GmService,
    RetailerService,
    MailerService,
    JwtAuthGuard
  ],  
})
export class AppModule {}
