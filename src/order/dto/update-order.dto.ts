import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Statut de la commande',
    example: 'completed',
    required: false,
    enum: ['pending', 'completed', 'cancelled'],
    type: String,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
