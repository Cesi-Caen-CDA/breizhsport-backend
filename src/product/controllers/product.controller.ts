import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../schemas/product.schema'; // Importez o schema do produto para o ApiResponse
import { ProductService } from '../services/product.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau produit' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Le produit a été créé avec succès.',
    type: Product, // Use o schema do produto para descrever a resposta
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de produit invalides',
  })
  @ApiBody({ type: CreateProductDto })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les produits' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des produits récupérée avec succès',
    type: [Product], // Use o schema do produto para descrever a lista
  })
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un produit par son ID' })
  @ApiParam({
    name: 'id',
    description: 'ID du produit (ObjectId)',
    required: true,
    type: String,
    format: 'ObjectId', // Adicione o formato para indicar que é um ObjectId
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit trouvé avec succès',
    type: Product, // Use o schema do produto para descrever a resposta
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put('update/:id')
  @ApiOperation({ summary: "Mettre à jour un produit (remplace l'existant)" })
  @ApiParam({
    name: 'id',
    description: 'ID du produit (ObjectId)',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit mis à jour avec succès',
    type: Product, // Use UpdateProductDto se você quiser mostrar os campos atualizáveis
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de mise à jour invalides',
  })
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Supprimer un produit' })
  @ApiParam({
    name: 'id',
    description: 'ID du produit (ObjectId)',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit supprimé avec succès',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.productService.remove(id);
    return { message: `Product with ID ${id} deleted successfully` }; // Resposta mais informativa
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour partiellement un produit' })
  @ApiParam({
    name: 'id',
    description: 'ID du produit (ObjectId)',
    required: true,
    type: String,
    format: 'ObjectId',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit mis à jour avec succès',
    type: Product, // Use UpdateProductDto se você quiser mostrar os campos atualizáveis
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données de mise à jour partielles invalides',
  })
  @ApiBody({ type: UpdateProductDto })
  partialUpdate(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }
}
