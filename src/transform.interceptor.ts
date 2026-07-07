import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

export interface ResponseFormat<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseFormat<T>> {
    // Only intercept HTTP requests
    if (context.getType() !== 'http') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return next.handle() as any;
    }

    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode || 200;

    return next.handle().pipe(
      map((data: unknown) => ({
        statusCode,
        message: 'Success',
        data: (data !== undefined ? data : null) as T,
      })),
    );
  }
}
