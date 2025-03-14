import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;
    const exceptionResponse = exception.getResponse();

    let formattedErrors = {};

    if (typeof exceptionResponse === 'string') {
      // Cas où `getResponse()` renvoie juste un message (ex: "Un utilisateur avec cet email existe déjà.")
      formattedErrors = { general: exceptionResponse };
    } else if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      // Cas où `getResponse()` renvoie un objet avec un tableau `message` (ex: DTO)
      if (Array.isArray(exceptionResponse.message)) {
        exceptionResponse.message.forEach((msg) => {
          if (msg.includes('nom')) formattedErrors['lastname'] = msg;
          if (msg.includes('prénom')) formattedErrors['firstname'] = msg;
          if (msg.includes('Email') || msg.includes('email'))
            formattedErrors['email'] = msg;
          if (msg.includes('mot de passe') || msg.includes('password'))
            formattedErrors['password'] = msg;
        });
      } else {
        // Cas où `message` est un string (ex: "Un utilisateur avec cet email existe déjà.")
        formattedErrors = { general: exceptionResponse.message };
      }
    }

    response.status(status).json({
      statusCode: status,
      errors: formattedErrors,
    });
  }
}
