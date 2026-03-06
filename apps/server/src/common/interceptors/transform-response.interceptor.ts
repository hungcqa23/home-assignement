import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponseShape<T> {
  data: T;
  message?: string;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ApiResponseShape<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponseShape<T>> {
    return next.handle().pipe(
      map((responseData) => {
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          return responseData;
        }
        return { data: responseData };
      }),
    );
  }
}
