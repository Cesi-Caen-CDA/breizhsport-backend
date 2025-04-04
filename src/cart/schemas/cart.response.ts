import { ApiProperty } from '@nestjs/swagger';

class ProductInCart {
    @ApiProperty({
        description: 'ID du produit',
        example: '507f1f77bcf86cd799439011',
        required: true,
        type: String,
    })
    product: string;

    @ApiProperty({
        description: 'Quantité',
        example: 1,
        type: Number,
    })
    quantity: number;
}

export class CartResponse {
    @ApiProperty({
        description: 'ID du panier',
        example: '507f1f77bcf86cd799439011',
        required: true,
        type: String,
    })
    _id: string;

    @ApiProperty({
        description: "ID de l'utilisateur",
        example: '507f1f77bcf86cd799439011',
        type: String,
    })
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    user: string;

    @ApiProperty({
        description: 'Liste des produits dans le panier',
        example: [
            {
                product: '507f1f77bcf86cd799439011',
                quantity: 2,
            },
        ],
        required: true,
        type: [ProductInCart],
    })
    products: ProductInCart[];

    @ApiProperty({
        description: 'Indique si le panier a été validé',
        example: false,
        type: Boolean,
    })
    checkedOut: boolean;
}
