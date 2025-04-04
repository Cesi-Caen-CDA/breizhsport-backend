import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @ApiProperty({
    description: "Nom de famille de l'utilisateur",
    example: 'Doe',
    required: true,
    type: String,
  })
  @Prop({ required: true })
  lastname: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'John',
    required: true,
    type: String,
  })
  @Prop({ required: true })
  firstname: string;

  @ApiProperty({
    description: "Adresse e-mail de l'utilisateur",
    example: 'john.doe@example.com',
    required: true,
    type: String,
    format: 'email', // Indique le format attendu
  })
  @Prop({ required: true })
  email: string;

  @ApiProperty({
    description:
      "Mot de passe de l'utilisateur (ne sera généralement pas affiché dans les réponses)",
    example: 'motdepasseSecurise',
    required: true,
    type: String,
  })
  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
