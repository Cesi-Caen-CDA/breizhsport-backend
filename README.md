# breizhsport-backend
NestJS backend for the breizh sport project

## Configuration

### .env file

The table below lists the environment variables needed to configure the project:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| PORT     | 8000          | Port number on which the server will run |
| DB_HOST  | localhost     | Database host address |
| DB_PORT  | 5432          | Database port |
| DB_USER  | user          | Database username |
| DB_PASS  | password      | Database password |
| JWT_SECRET | your_secret_key | Secret key for JWT token generation |

Make sure to configure these variables in your `.env` file before starting the server.

Example configuration in the `.env` file:

```env
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASS=mypassword
JWT_SECRET=mysecretkey
```

## DataBase 

The data base is MongoDB and we're using the mongoose ORM

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/breizhsport-backend.git
cd breizhsport-backend
```

>[!NOTE]
> If you want a version of the front end, made in NuxtJs, you can find it at : https://github.com/Cesi-Caen-CDA/breizhsport-frontend.git

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## API Documentation

The API documentation is available through Swagger UI at `/api` when the server is running. You can access it at:
```
http://localhost:8000/api
```

### Available Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |

Login Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create new user |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |
| GET | `/users/profile/:id` | Get user profile (protected) |
| PATCH | `/users/profile/:id` | Update user profile (protected) |

Create User DTO:
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create new product |
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |
| PUT | `/products/update/:id` | Update product |
| DELETE | `/products/delete/:id` | Delete product |

Product DTO:
```json
{
  "name": "Product Name",
  "price": 99.99,
  "category": "Category",
  "description": "Product description",
  "stock": 10
}
```

#### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/carts/add/:productId` | Add product to cart |
| GET | `/carts/:userId` | Get user's cart |
| DELETE | `/carts/remove/:productId` | Remove product from cart |

Add to Cart Request:
```json
{
  "userId": "user_id",
  "quantity": 1
}
```

#### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/create` | Create new order |
| GET | `/orders/history/:userId` | Get order history |
| PATCH | `/orders/:id` | Update order status |

Create Order DTO:
```json
{
  "userId": "user_id",
  "products": [
    {
      "productId": "product_id",
      "quantity": 1
    }
  ]
}
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Project Structure

```
src/
├── auth/           # Authentication related files
├── cart/           # Shopping cart functionality
├── order/          # Order management
├── product/        # Product management
├── user/           # User management
├── database/       # Database configuration
└── main.ts         # Application entry point
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "statusCode": 400,
  "errors": {
    "field": "Error message",
    "general": "General error message"
  }
}
```

## Docker Support

The project includes Docker configuration for easy deployment. To run using Docker:

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

