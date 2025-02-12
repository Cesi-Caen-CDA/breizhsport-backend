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

describe('CartController (e2e)', () => {
  let app: INestApplication;
  let cartModel: Model<Cart>;
  let userModel: Model<User>;
  let productModel: Model<Product>;
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
    };
  };

  beforeAll(async () => {
    ({ app, cartModel, userModel, productModel } = await createApp());

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

  describe('POST /carts/add/:productId', () => {
    it('devrait ajouter un produit au panier', async () => {
      const response = await request(app.getHttpServer())
        .post(`/carts/add/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 2, userId: userId })
        .expect(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].quantity).toBe(2);
    });

    it('devrait retourner une erreur 404 si le produit est introuvable', async () => {
      const invalidProductId = '607f1f77bcf86cd799439012'; // ID non existant

      await request(app.getHttpServer())
        .post(`/carts/add/${invalidProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 2 })
        .expect(404);
    });

    it("devrait retourner une erreur 404 si l'utilisateur est introuvable", async () => {
      const invalidUserId = '607f1f77bcf86cd799439012'; // ID non existant

      await request(app.getHttpServer())
        .post(`/carts/add/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 2, userId: invalidUserId })
        .expect(404);
    });

    it('devrait retourner une erreur 404 si le panier est introuvable', async () => {
      // Supprimer le panier existant pour s'assurer qu'il est introuvable
      await cartModel.deleteMany({ user: userId });

      await request(app.getHttpServer())
        .post(`/carts/add/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 2 })
        .expect(404);
    });
  });

  describe('GET /carts/:userId', () => {
    it("devrait récupérer le panier d'un utilisateur existant", async () => {
      const response = await request(app.getHttpServer())
        .get(`/carts/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200); // Vérifie le code de statut 200 (OK)

      // Vérifie que le panier est bien récupéré
      expect(response.body).toHaveProperty('_id');
      expect(response.body.user).toBe(userId);
      expect(response.body.products).toHaveLength(1); // Assure-toi que le panier contient le produit ajouté
      expect(response.body.products[0].quantity).toBe(2); // Vérifie que la quantité est correcte
      expect(response.body.products[0].product).toHaveProperty(
        'name',
        'Product 1',
      ); // Vérifie le nom du produit
    });

    it("devrait retourner une erreur 404 si le panier n'existe pas pour un utilisateur", async () => {
      let idUser = new Types.ObjectId(userId);
      // Supprimer le panier pour que l'utilisateur n'ait pas de panier
      test = await cartModel.findOne({ user: idUser });
      // Supprimer le panier existant de l'utilisateur s'il existe
      await cartModel.deleteMany({ user: idUser });
      const response = await request(app.getHttpServer())
        .get(`/carts/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404); // Devrait retourner une erreur 404 si le panier est introuvable
    });

    it('devrait retourner une erreur 404 si le panier existe mais est vide', async () => {
      // Supprimer le panier existant de l'utilisateur s'il existe
      await cartModel.deleteMany({ user: userId });
      // Créer un panier vide pour l'utilisateur
      await cartModel.create({ user: userId, checkedOut: false, products: [] });

      const response = await request(app.getHttpServer())
        .get(`/carts/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404); // Devrait retourner une erreur 404 si le panier est vide
    });
  });

  describe('DELETE /carts/remove/:productId', () => {
    it('devrait supprimer un produit du panier', async () => {
      // Ajouter un produit au panier
      const cart = await request(app.getHttpServer())
        .post(`/carts/add/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 2, userId: userId })
        .expect(201);

      // Supprimer le produit du panier
      const response = await request(app.getHttpServer())
        .delete(`/carts/remove/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: userId })
        .expect(200);

      // Vérifie que le produit a bien été supprimé du panier
      expect(response.body.products.length).toBe(0); // Panier vide après suppression
    });

    it("devrait retourner une erreur 404 si le produit n'est pas trouvé dans le panier", async () => {
      const invalidProductId = '607f1f77bcf86cd799439012'; // ID non existant

      const response = await request(app.getHttpServer())
        .delete(`/carts/remove/${invalidProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: userId })
        .expect(404); // Devrait retourner une erreur 404 si le produit n'existe pas dans le panier
    });

    it('devrait retourner une erreur 404 si le panier est introuvable', async () => {
      // Supprimer le panier pour s'assurer qu'il est introuvable
      await cartModel.deleteMany({ user: userId });

      const response = await request(app.getHttpServer())
        .delete(`/carts/remove/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: userId })
        .expect(404); // Devrait retourner une erreur 404 si le panier n'existe pas
    });
  });
});
