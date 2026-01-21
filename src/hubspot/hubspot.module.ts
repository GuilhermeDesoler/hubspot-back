import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HubspotController } from './hubspot.controller';
import { HubspotService } from './hubspot.service';
import { Option, OptionSchema } from '../database/schemas/option.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }])
  ],
  controllers: [HubspotController],
  providers: [HubspotService],
  exports: [HubspotService]
})
export class HubspotModule {}
