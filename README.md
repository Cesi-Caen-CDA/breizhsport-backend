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

## DataBase 

The data base is MongoDB and we're using the mongoose ORM