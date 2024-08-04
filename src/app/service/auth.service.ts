import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, switchMap, catchError, throwError } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model'; // Adjust the path as needed
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private baseUrl = environment.apiUrl; // Adjust URL if necessary
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        this.loadTokens();
    }

    private storeUserInfo(user: { name: string; email: string }) {
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
    }

    private storeTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    private removeTokens(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }

    private loadTokens(): void {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        this.refreshTokenSubject.next(refreshToken);
    }

    login(email: string, password: string): Observable<AuthResponse | null> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
            switchMap((response) => {
                if (response && response.accessToken && response.refreshToken) {
                    this.storeTokens(response.accessToken, response.refreshToken);
                    this.storeUserInfo(response.user);
                }
                return of(response);
            }),
            catchError((error) => {
                console.error('Login failed', error);
                return of(null);
            })
        );
    }

    refreshAccessToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            return of(null);
        }

        return this.http.post(`${this.baseUrl}/refresh-token`, { refreshToken }).pipe(
            switchMap((response: any) => {
                if (response && response.accessToken) {
                    this.storeTokens(response.accessToken, response.refreshToken);
                    return of(response);
                } else {
                    this.removeTokens();
                    return of(null);
                }
            }),
            catchError((error) => {
                console.error('Refresh token failed', error);
                this.removeTokens();
                return of(null);
            })
        );
    }

    logout(): void {
        this.removeTokens();
        console.log('access, refresh - token removed');
        this.router.navigate(['/auth/boxed-signin']);
    }
}
