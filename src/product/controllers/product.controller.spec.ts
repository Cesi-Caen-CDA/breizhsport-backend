import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

// Mock du ProductService
const mockProductService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
  });

  // Test de la méthode create()
  describe('create', () => {
    it('should call productService.create and return the result', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Product 1',
        price: 100,
        description: 'Description of Product 1',
        category: 'Category 1',
        stock: 10,
      };

      const product = { _id: '1', ...createProductDto };
      mockProductService.create.mockResolvedValue(product);

      const result = await productController.create(createProductDto);

      expect(result).toEqual(product);
      expect(mockProductService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  // Test de la méthode findAll()
  describe('findAll', () => {
    it('should call productService.findAll and return an array of products', async () => {
      const products = [{ _id: '1', name: 'Product 1', price: 100 }];
      mockProductService.findAll.mockResolvedValue(products);

      const result = await productController.findAll();
      expect(result).toEqual(products);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });
  });

  // Test de la méthode findOne()
  describe('findOne', () => {
    it('should call productService.findOne and return the product', async () => {
      const product = { _id: '1', name: 'Product 1', price: 100 };
      mockProductService.findOne.mockResolvedValue(product);

      const result = await productController.findOne('1');
      expect(result).toEqual(product);
      expect(mockProductService.findOne).toHaveBeenCalledWith('1');
    });
  });

  // Test de la méthode update()
  describe('update', () => {
    it('should call productService.update and return the updated product', async () => {
      const updateProductDto: UpdateProductDto = {
        price: 50,
        category: 'Category 2',
        description: 'Ceci est une description',
        stock: 3,
      };
      const updatedProduct = { _id: '1', ...updateProductDto };
      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await productController.update('1', updateProductDto);
      expect(result).toEqual(updatedProduct);
      expect(mockProductService.update).toHaveBeenCalledWith(
        '1',
        updateProductDto,
      );
    });
  });

  // Test de la méthode remove()
  describe('remove', () => {
    it('should call productService.remove and return nothing', async () => {
      mockProductService.remove.mockResolvedValue(undefined);

      await productController.remove('1');
      expect(mockProductService.remove).toHaveBeenCalledWith('1');
    });
  });

  // Test de la méthode partialUpdate()
  describe('partialUpdate', () => {
    it('should call productService.update and return the updated product', async () => {
      const updateProductDto: UpdateProductDto = {
        description: 'Partial Update Product',
      };
      const updatedProduct = { _id: '1', ...updateProductDto };
      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await productController.partialUpdate(
        '1',
        updateProductDto,
      );
      expect(result).toEqual(updatedProduct);
      expect(mockProductService.update).toHaveBeenCalledWith(
        '1',
        updateProductDto,
      );
    });
  });
});
