import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Module({
  imports: [
    ConfigModule.forRoot(), // Charge les variables d'environnement
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isTestEnv = process.env.NODE_ENV === 'test';
        if (isTestEnv) {
          // Si on est en mode test, utiliser Mongo en mémoire
          const mongoServer = await MongoMemoryServer.create();
          const mongoUri = mongoServer.getUri();
          return { uri: mongoUri };
        } else {
          // Sinon, utiliser la configuration de production ou développement
          return {
            uri: configService.get<string>('MONGO_URI'), // On récupère l'URI de production ou dev à partir du fichier .env
          };
        }
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
  async onModuleInit() {
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connection established successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
  }
}
