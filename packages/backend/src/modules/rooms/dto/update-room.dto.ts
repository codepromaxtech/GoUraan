import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  // All properties from CreateRoomDto are made optional by PartialType
  // We can add additional update-specific validations or properties here if needed
}
