import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../schemas/product.schema';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';


describe('ProductService', () => {
  let productService: ProductService;
  let productModel: any;

  const mockProduct = {
    _id: new Types.ObjectId(),
    name: 'Product 1',
    price: 50,
    category: 'Category 1',
    description: 'Product description',
    stock: 10,
  };

  // Mock du modèle Mongoose avec toutes les méthodes nécessaires
  const mockProductModel = {
    create: jest.fn().mockResolvedValue(mockProduct),
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockProduct]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockProduct),
    }),
      // ... autres mocks
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct), // Pour le test de succès
      }),
  };

  // Simule l'instanciation d'un nouveau document avec save()
  const mockProductInstance = {
    save: jest.fn().mockResolvedValue(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: jest.fn(() => mockProductInstance), // Simule le constructeur
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get(getModelToken(Product.name));

    // Attache les méthodes statiques manuellement (en plus du constructeur)
    Object.assign(productModel, mockProductModel);
  });

  describe('create', () => {
    it('devrait créer un produit avec succès', async () => {
      const createProductDto = {
        name: 'Product 1',
        price: 50,
        category: 'Category 1',
        description: 'Product description',
        stock: 10,
      };

      const result = await productService.create(createProductDto);

      // Vérifie que le constructeur a été appelé avec les bonnes données
      expect(productModel).toHaveBeenCalledWith(createProductDto);

      // Vérifie que save() a été appelé
      expect(mockProductInstance.save).toHaveBeenCalled();

      // Vérifie que le résultat est bien le mockProduct
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('devrait retourner tous les produits', async () => {
      const result = await productService.findAll();

      expect(productModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('devrait retourner un produit par son ID', async () => {
      const productId = mockProduct._id.toString();

      const result = await productService.findOne(productId);

      expect(productModel.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProduct);
    });

    it("devrait retourner null si le produit n'existe pas", async () => {
      const productId = new Types.ObjectId().toString();

      productModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      try {
        const result = await productService.findOne(productId);
      } catch (error) {
        expect(error.response.statusCode).toBe(404); // Vérifie le code de statut
      }
      expect(productModel.findById).toHaveBeenCalledWith(productId);
      
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un produit avec succès', async () => {
      const productId = mockProduct._id.toString();
      const updateProductDto = { price: 60 };

      const result = await productService.update(productId, updateProductDto);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        updateProductDto,
        { new: true },
      );
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('devrait supprimer un produit avec succès', async () => {
      const createProductDto = {
        name: 'Product 1',
        price: 50,
        category: 'Category 1',
        description: 'Product description',
        stock: 10,
      };
      const result = await productService.create(createProductDto);
      const productId = result._id.toString();
  
      // Mock spécifique pour ce test: simule une suppression réussie
      jest.spyOn(productModel, 'findByIdAndDelete').mockResolvedValue({ /* ... */ }); // Retourne un objet (peu importe lequel)
  
      await productService.remove(productId);
  
      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(productId);
    });
  
    it('devrait lancer une NotFoundException si le produit n\'existe pas', async () => {
      const productId = 'non-existent-id';
    
      // Mock spécifique pour ce test: simule un produit non trouvé
      jest.spyOn(productModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
    
      await expect(productService.remove(productId)).rejects.toThrow(NotFoundException);
    });
  });
});
