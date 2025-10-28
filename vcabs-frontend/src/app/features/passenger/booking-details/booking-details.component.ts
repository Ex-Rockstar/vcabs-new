import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { Booking } from '../models/booking.model';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.css']
})
export class BookingDetailsComponent implements OnInit {
  booking: Booking | null = null;
  bookingId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';
    this.loadBookingDetails();
  }

  private loadBookingDetails(): void {
    this.bookingService.getBookingById(this.bookingId).subscribe(booking => {
      this.booking = booking || null;
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/passenger/dashboard']);
  }

  cancelBooking(): void {
    if (this.booking) {
      this.bookingService.cancelBooking(this.booking.id).subscribe(() => {
        this.loadBookingDetails();
      });
    }
  }
}


