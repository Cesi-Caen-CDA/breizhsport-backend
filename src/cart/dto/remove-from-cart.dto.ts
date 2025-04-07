import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RemoveFromCartDto {
    @ApiProperty({
        description: "ID de l'utilisateur",
        example: '507f1f77bcf86cd799439011',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    userId: string;
}
