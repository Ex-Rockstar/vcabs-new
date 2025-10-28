import { Component, OnInit } from '@angular/core';
import { DriverService, RideRequest } from '../../../core/services/driver';
import { NgIf, NgFor } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ride-requests',
  standalone: true,  // Set true if standalone component preferred
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './ride-requests.html',
  styleUrls: ['./ride-requests.css'],
})
export class RideRequests implements OnInit {
  rideRequests: RideRequest[] = [];
  isLoading: boolean = false;
  
  constructor(private driverService: DriverService) {}

  ngOnInit(): void {
    this.fetchRideRequests();
  }

  fetchRideRequests(): void {
    this.isLoading = true;
    this.driverService.getRideRequests().subscribe({
      next: (data) => {
        this.rideRequests = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to load ride requests');
      }
    });
  }

  acceptRequest(rideId: string): void {
    const originalRequests = [...this.rideRequests];
    this.rideRequests = this.rideRequests.filter(r => r.id !== rideId);

    this.driverService.acceptRideRequest(rideId).subscribe({
      next: () => alert('Ride accepted'),
      error: () => {
        alert('Failed to accept ride');
        this.rideRequests = originalRequests; // rollback on failure
      }
    });
  }

  rejectRequest(rideId: string): void {
    const originalRequests = [...this.rideRequests];
    this.rideRequests = this.rideRequests.filter(r => r.id !== rideId);

    this.driverService.rejectRideRequest(rideId).subscribe({
      next: () => alert('Ride rejected'),
      error: () => {
        alert('Failed to reject ride');
        this.rideRequests = originalRequests; // rollback on failure
      }
    });
  }
}
