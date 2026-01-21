import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OptionDocument = Option & Document;

@Schema({ timestamps: true })
export class Option {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  value: string;

  @Prop({ default: 'contacts' })
  objectType: string;

  @Prop({ default: 'sua_propriedade_customizada' })
  propertyName: string;

  @Prop({ default: false })
  synced: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
