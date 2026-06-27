import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface ResponseFormat<T> {
    statusCode: number;
    message: string;
    data: T;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>>;
}
