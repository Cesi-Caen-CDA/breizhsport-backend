import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Cart } from '../src/cart/schemas/cart.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../src/user/schemas/user.schema';
import { Product } from '../src/product/schemas/product.schema';
import { JwtService } from '@nestjs/jwt';
import { Order } from '../src/order/schemas/order.schema';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let cartModel: Model<Cart>;
  let userModel: Model<User>;
  let productModel: Model<Product>;
  let orderModel: Model<Order>;
  let jwtService: JwtService;
  let userId: string;
  let productId: string;
  let token: string;

  const createApp = async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    jwtService = app.get(JwtService);
    await app.init();

    return {
      app,
      cartModel: moduleFixture.get<Model<Cart>>(getModelToken(Cart.name)),
      userModel: moduleFixture.get<Model<User>>(getModelToken(User.name)),
      productModel: moduleFixture.get<Model<Product>>(
        getModelToken(Product.name),
      ),
      orderModel: moduleFixture.get<Model<Order>>(getModelToken(Order.name)),
    };
  };

  beforeEach(async () => {
    ({ app, cartModel, userModel, productModel, orderModel } =
      await createApp());

    // Création de l'utilisateur
    const createUserDto = {
      email: 'protected@example.com',
      password: 'password123',
      firstname: 'Protected',
      lastname: 'User',
    };
    const responseUser = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);
    userId = responseUser.body.user._id;

    // Création du produit
    const createProductDto = {
      name: 'Product 1',
      price: 100,
      category: 'Category 1',
      description: 'Product description',
      stock: 10,
    };
    const responseProduct = await request(app.getHttpServer())
      .post('/products')
      .send(createProductDto)
      .expect(201);
    productId = responseProduct.body._id;

    // Récupération du token JWT
    const payload = { userId: userId, email: createUserDto.email };
    token = jwtService.sign(payload);

    // Création du panier pour l'utilisateur
    await request(app.getHttpServer())
      .post(`/carts/add/${productId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2, userId: userId })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders/create', () => {
    it('devrait créer une commande avec des produits valides', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [{ productId: productId, quantity: 2 }],
        })
        .expect(201);
      expect(response.body).toHaveProperty('totalPrice', 200);
      expect(response.body.status).toBe('pending');
    });

    it('devrait renvoyer une erreur 404 si le panier est vide', async () => {
      await cartModel.deleteMany({ user: new Types.ObjectId(userId) });
      await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [],
        })
        .expect(404);
    });

    it('devrait renvoyer une erreur 404 si le stock est insuffisant', async () => {
      await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [{ productId: productId, quantity: 15 }],
        })
        .expect(404);
    });

    it("devrait renvoyer une erreur 404 si le produit n'existe pas", async () => {
      const invalidProductId = '60d21b4667d0d8992e610c99';
      await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [{ productId: invalidProductId, quantity: 1 }],
        })
        .expect(404);
    });

    it('devrait mettre à jour le stock après création de la commande', async () => {
      const initialStock = (await productModel.findById(productId)).stock;
      await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [{ productId: productId, quantity: 2 }],
        })
        .expect(201);

      const updatedStock = (await productModel.findById(productId)).stock;
      expect(updatedStock).toBe(initialStock - 2);
    });

    it('devrait renvoyer une erreur si la quantité est supérieure au stock', async () => {
      await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [{ productId: productId, quantity: 100 }],
        })
        .expect(404);
    });
  });

  describe('PATCH /orders/:id', () => {
    it("devrait mettre à jour le statut d'une commande", async () => {
      // Création d'une commande
      const order = await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [{ productId: productId, quantity: 2 }],
        })
        .expect(201); // 201 Created
      const stringOrderId = order.body._id;
      // Mise à jour du statut de la commande
      const response = await request(app.getHttpServer())
        .patch(`/orders/${stringOrderId}`)
        .expect(200); // 200 OK

      // Vérifier que le statut a bien été mis à jour
      expect(response.body.status).toBe('completed');
    });

    it("devrait renvoyer une erreur si la commande n'existe pas", async () => {
      const invalidOrderId = '60d21b4667d0d8992e610c99'; // ID inexistant

      await request(app.getHttpServer())
        .patch(`/orders/${invalidOrderId}`)
        .expect(404); // 404 Not Found
    });
  });

  describe('GET /orders/history/:userId', () => {
    it("devrait retourner l'historique des commandes de l'utilisateur", async () => {
      // Création d'une commande
      const order = await request(app.getHttpServer())
        .post('/orders/create')
        .send({
          userId: userId,
          products: [{ productId: productId, quantity: 2 }],
        })
        .expect(201); // 201 Created
      const stringOrderId = order.body._id;
      // Mise à jour du statut de la commande
      const updatedOrder = await request(app.getHttpServer())
        .patch(`/orders/${stringOrderId}`)
        .expect(200); // 200 OK

      // Vérifier que le statut a bien été mis à jour
      expect(updatedOrder.body.status).toBe('completed');

      const response = await request(app.getHttpServer())
        .get(`/orders/history/${updatedOrder.body.user}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('totalPrice');
      expect(response.body[0]).toHaveProperty('status');
    });
  });
});
