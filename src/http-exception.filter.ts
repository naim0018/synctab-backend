import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Only apply to HTTP requests
    if (host.getType() !== 'http') {
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (exception instanceof HttpException) {
      const resContent: any = exception.getResponse();
      message = typeof resContent === 'object' && resContent.message
        ? (Array.isArray(resContent.message) ? resContent.message.join(', ') : resContent.message)
        : exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      data: null,
    });
  }
}
