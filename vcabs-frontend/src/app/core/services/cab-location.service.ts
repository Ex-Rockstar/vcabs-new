import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DriverLocation { latitude: number; longitude: number; }

@Injectable({ providedIn: 'root' })
export class CabLocationService {
  private base = `${environment.apiUrl}/cabs`;
  constructor(private http: HttpClient) {}

  updateLocation(driverId: number, location: DriverLocation): Observable<any> {
    return this.http.post(`${this.base}/${driverId}/location`, {
      latitude: location.latitude,
      longitude: location.longitude
    });
  }

  getLocation(driverId: number): Observable<{ driverId: number; latitude: number; longitude: number }> {
    return this.http.get<{ driverId: number; latitude: number; longitude: number }>(`${this.base}/${driverId}/location`);
  }

  getAllLocations(): Observable<Record<number, DriverLocation>> {
    return this.http.get<Record<number, DriverLocation>>(`${this.base}/locations`);
  }
}
