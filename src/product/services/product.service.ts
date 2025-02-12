import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Création du produit à partir du DTO
      const product = new this.productModel(createProductDto);

      // Sauvegarde du produit dans la base de données
      return await product.save();
    } catch (error) {
      // Gérer les erreurs liées à la création (par exemple erreurs MongoDB, validation échouée, etc.)
      console.error('Erreur lors de la création du produit:', error);

      throw new InternalServerErrorException(
        'Erreur interne lors de la création du produit. Veuillez réessayer plus tard.',
      );
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await this.productModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve products');
    }
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Le produit avec l'id ${id} n'existe pas.`);
    }

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct) {
      throw new NotFoundException(`Le produit avec l'id ${id} n'existe pas.`);
    }
  }
}
