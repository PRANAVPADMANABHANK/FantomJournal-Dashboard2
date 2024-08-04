import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service'; // Adjust the path if necessary

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle token refresh
          return this.authService.refreshAccessToken().pipe(
            switchMap((newTokens: any) => {
              if (newTokens && newTokens.accessToken) {
                req = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newTokens.accessToken}`
                  }
                });
                return next.handle(req);
              } else {
                this.authService.logout();
                return throwError(error);
              }
            }),
            catchError(err => {
              this.authService.logout();
              return throwError(err);
            })
          );
        }
        return throwError(error);
      })
    );
  }
}
