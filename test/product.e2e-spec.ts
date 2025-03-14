import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Product } from '../src/product/schemas/product.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let productModel: Model<Product>;

  const createApp = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    return {
      app,
      productModel: moduleFixture.get<Model<Product>>(
        getModelToken(Product.name),
      ),
    };
  };

  describe('POST /products', () => {
    beforeAll(async () => {
      ({ app, productModel } = await createApp());
    });

    afterAll(async () => {
      await app.close();
    });

    it('devrait créer un produit', async () => {
      const createProductDto = {
        name: 'Product 1',
        price: 100,
        category: 'Category 1',
        description: 'Product description',
        stock: 10,
      };

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(createProductDto)
        .expect(201);

      expect(response.body.name).toBe(createProductDto.name);
      expect(response.body.price).toBe(createProductDto.price);
      expect(response.body.category).toBe(createProductDto.category);
      expect(response.body.description).toBe(createProductDto.description);
      expect(response.body.stock).toBe(createProductDto.stock);
    });
  });

  describe('GET /products/:id', () => {
    let createdProduct: Product;

    beforeAll(async () => {
      ({ app, productModel } = await createApp());
      createdProduct = await productModel.create({
        name: 'Product 1',
        price: 100,
        category: 'Category 1',
        description: 'Description',
        stock: 10,
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it('devrait retourner un produit par ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${createdProduct._id}`)
        .expect(200);

      expect(response.body.name).toBe(createdProduct.name);
      expect(response.body.price).toBe(createdProduct.price);
      expect(response.body.category).toBe(createdProduct.category);
      expect(response.body.description).toBe(createdProduct.description);
      expect(response.body.stock).toBe(createdProduct.stock);
    });

    it("devrait retourner 404 si le produit n'existe pas", async () => {
      const invalidId = '607f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .get(`/products/${invalidId}`)
        .expect(404);
    });
  });

  describe('GET /products', () => {
    beforeAll(async () => {
      ({ app, productModel } = await createApp());

      // Nettoyer les produits existants et insérer des produits pour les tests GET
      await productModel.deleteMany({});
      await productModel.insertMany([
        {
          name: 'Product 1',
          price: 100,
          category: 'Category 1',
          description: 'Description 1',
          stock: 10,
        },
        {
          name: 'Product 2',
          price: 200,
          category: 'Category 2',
          description: 'Description 2',
          stock: 5,
        },
      ]);
    });

    afterAll(async () => {
      await app.close();
    });

    it('devrait retourner tous les produits avec les bonnes propriétés', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      response.body.forEach((product) => {
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('stock');
      });

      expect(response.body[0].name).toBe('Product 1');
      expect(response.body[0].price).toBe(100);
      expect(response.body[1].name).toBe('Product 2');
      expect(response.body[1].price).toBe(200);
    });

    it('devrait retourner un tableau vide si aucun produit n’est trouvé', async () => {
      // Supprimer tous les produits pour simuler un scénario sans produits
      await productModel.deleteMany({});

      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });
  describe('PUT /products/update/:id', () => {
    let createdProduct: Product;

    beforeAll(async () => {
      ({ app, productModel } = await createApp());
      createdProduct = await productModel.create({
        name: 'Product to update',
        price: 50,
        category: 'Update Category',
        description: 'Description before update',
        stock: 20,
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it('devrait mettre à jour un produit existant', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        price: 150,
        category: 'Updated Category',
        description: 'Updated description',
        stock: 5,
      };

      const response = await request(app.getHttpServer())
        .put(`/products/update/${createdProduct._id}`)
        .send(updateProductDto)
        .expect(200);

      expect(response.body.name).toBe(updateProductDto.name);
      expect(response.body.price).toBe(updateProductDto.price);
      expect(response.body.category).toBe(updateProductDto.category);
      expect(response.body.description).toBe(updateProductDto.description);
      expect(response.body.stock).toBe(updateProductDto.stock);
    });

    it("devrait retourner 404 si le produit à mettre à jour n'existe pas", async () => {
      const invalidId = '607f1f77bcf86cd799439011';
      const updateProductDto = {
        name: 'Non-existent Product',
        price: 999,
      };

      await request(app.getHttpServer())
        .put(`/products/update/${invalidId}`)
        .send(updateProductDto)
        .expect(404);
    });
  });

  describe('PATCH /products/:id', () => {
    let createdProduct: Product;

    beforeAll(async () => {
      ({ app, productModel } = await createApp());
      createdProduct = await productModel.create({
        name: 'Product for partial update',
        price: 300,
        category: 'Patch Category',
        description: 'Initial description',
        stock: 15,
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it('devrait mettre à jour partiellement un produit', async () => {
      const partialUpdateDto = {
        price: 400,
      };

      const response = await request(app.getHttpServer())
        .patch(`/products/${createdProduct._id}`)
        .send(partialUpdateDto)
        .expect(200);

      expect(response.body.price).toBe(partialUpdateDto.price);
      expect(response.body.name).toBe(createdProduct.name); // les autres propriétés restent inchangées
    });

    it("devrait retourner 404 si le produit à mettre à jour partiellement n'existe pas", async () => {
      const invalidId = '607f1f77bcf86cd799439011';
      const partialUpdateDto = {
        stock: 50,
      };

      await request(app.getHttpServer())
        .patch(`/products/${invalidId}`)
        .send(partialUpdateDto)
        .expect(404);
    });
  });

  describe('DELETE /products/delete/:id', () => {
    let productToDelete: Product;

    beforeAll(async () => {
      ({ app, productModel } = await createApp());

      // Créer un produit pour le supprimer dans le test
      productToDelete = await productModel.create({
        name: 'Product to Delete',
        price: 150,
        category: 'Category Delete',
        description: 'Description to delete',
        stock: 3,
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it('devrait supprimer un produit existant', async () => {
      await request(app.getHttpServer())
        .delete(`/products/delete/${productToDelete._id}`)
        .expect(200);

      // Vérifier que le produit a bien été supprimé de la base
      const deletedProduct = await productModel
        .findById(productToDelete._id)
        .exec();
      expect(deletedProduct).toBeNull();
    });

    it("devrait retourner 404 si le produit à supprimer n'existe pas", async () => {
      const invalidId = '607f1f77bcf86cd799439011';

      const response = await request(app.getHttpServer())
        .delete(`/products/delete/${invalidId}`)
        .expect(404);

      expect(response.body.message).toBe(
        `Le produit avec l'id ${invalidId} n'existe pas.`,
      );
    });
  });
});
