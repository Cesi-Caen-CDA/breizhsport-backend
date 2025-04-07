import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddToCartDto {
    @ApiProperty({
        description: "ID de l'utilisateur",
        example: '507f1f77bcf86cd799439011',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Quantité à ajouter',
        example: 1,
        minimum: 1,
        required: true,
    })
    @IsNumber()
    @Min(1)
    quantity: number;
}
