import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OtpService {
  private base = `${environment.apiUrl}/otp`;
  constructor(private http: HttpClient) {}

  send(email: string): Observable<string> {
    return this.http.post(`${this.base}/generateotp/${encodeURIComponent(email)}`, {}, { responseType: 'text' });
  }

  verify(email: string, otp: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/verifyotp/${encodeURIComponent(email)}/${encodeURIComponent(otp)}`, {});
  }
}
