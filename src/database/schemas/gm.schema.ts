import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GM extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false }) // Add isVerified property
  isVerified: boolean;
}

export const GMSchema = SchemaFactory.createForClass(GM);
