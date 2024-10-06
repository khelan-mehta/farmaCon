import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Facts extends Document {

  @Prop({ required: true, type: Types.ObjectId })
  createdBy: string;

  @Prop({ required: true, alias: "address" })
  _add: string;
  
  @Prop({ required: true, alias: "geoCode", index: true, type: {lat: Number, long: Number}})
  _gc;

  @Prop({ required: true, alias: "placeName"})
  _nm: string

  @Prop({ required: true, default: false })
  isSuspended: false

  @Prop({ required: true, default: 0, max: 5, min: 0, alias: "waterOdour"})
  wod: Number;

  @Prop({ required: true, default: 0, max: 5, min: 0, alias: "waterAlgaeContent"})
  wafc: Number;

  @Prop({ required: true, default: 0, max: 5, min: 0, alias: "waterColour"})
  wc: Number;

  @Prop({ required: true, default: 0, max: 5, min: 0, alias: "dustbinDivision"})
  dd: Number;

  @Prop({ required: true, default: 0, max: 5, min: 0, alias: "dustbinNumber"})
  dn: Number;

  @Prop({ required: true, default: 0, max: 5, min: 0, alias: "dustbinDistrobution"})
  ddistro: Number;

  @Prop({ required: true, default: 0, max: 5, min: 0})
  pests: Number;

  @Prop({ required: true, default: 0, max: 5, min: 0})
  greenery: Number;

  @Prop({ default: Date.now()})
  createdAt: Date;
  
}

export const FactsSchema = SchemaFactory.createForClass(Facts);
