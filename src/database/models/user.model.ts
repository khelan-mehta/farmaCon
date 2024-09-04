import mongoose from 'mongoose';
import { UserSchema } from '../schemas/user.schema';
import { User } from 'src/dto/interfaces/user.interface';

export const UserModel = mongoose.model<User>('User', UserSchema);