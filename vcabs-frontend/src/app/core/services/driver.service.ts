import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private base = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  setAvailability(available: boolean): Observable<any> {
    return this.http.post(`${this.base}/driver/availability`, { available });
  }

  startRide(rideId: number): Observable<any> {
    return this.http.post(`${this.base}/driver/${rideId}/start`, {});
  }

  completeRide(rideId: number): Observable<any> {
    return this.http.post(`${this.base}/driver/${rideId}/complete`, {});
  }

  cancelRide(rideId: number): Observable<any> {
    return this.http.post(`${this.base}/driver/${rideId}/cancel`, {});
  }

  history(): Observable<any> {
    return this.http.get(`${this.base}/driver/history`);
  }
}
