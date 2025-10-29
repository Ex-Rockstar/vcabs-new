import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private base = `${environment.apiUrl}/customer`;
  constructor(private http: HttpClient) {}

  home(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.base}/home`);
  }

  requestRide(dto: any): Observable<any> {
    return this.http.post(`${this.base}/rides/request`, dto);
  }

  cancelRide(rideId: number): Observable<any> {
    return this.http.post(`${this.base}/rides/${rideId}/cancel`, {});
  }

  history(): Observable<any> {
    return this.http.get(`${this.base}/rides/history`);
  }
}
