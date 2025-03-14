// src/order/dto/update-order.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  status?: string;
}
