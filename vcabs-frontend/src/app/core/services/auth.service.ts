import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginRequest { email: string; password: string; }
interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
  otp?: string;
  driverDetails?: { licenseNumber: string; vehicleNumber: string };
}
interface AuthResponse { token: string; role: 'ADMIN' | 'CUSTOMER' | 'DRIVER'; email: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;
  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('email', res.email);
      })
    );
  }

  register(payload: RegisterRequest): Observable<any> {
    return this.http.post(`${this.base}/register`, payload);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  }

  get token(): string | null { return localStorage.getItem('token') || sessionStorage.getItem('token'); }
  get role(): string | null { return localStorage.getItem('role'); }
  get isAuthenticated(): boolean { return !!this.token; }
}
