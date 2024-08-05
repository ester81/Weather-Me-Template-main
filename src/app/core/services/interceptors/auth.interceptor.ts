import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.error('Network error:', error.message);
        } else if (error.status === 503) {
          console.error('Service Unavailable (503):', error.message);
        } else {
          console.error('An error occurred:', error.message);
        }
        return throwError(
          () => new Error('Something bad happened; please try again later.')
        );
      })
    );
  }
}
