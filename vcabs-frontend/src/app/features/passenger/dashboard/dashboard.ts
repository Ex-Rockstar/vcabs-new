import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { CustomerService } from '../services/customer.service';
import { Booking, BookingStats, Customer } from '../models/booking.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  customer: Customer;
  stats: BookingStats = {
    totalBookings: 0,
    totalSpent: 0,
    averageBookingValue: 0,
    favoriteCabType: '4-seater',
    lastBookingDate: new Date(),
    bookingsByType: {
      trip: 0,
      intercity: 0,
       rental: 0,
      reserve: 0
    }
  };
  recentBookings: Booking[] = [];

  constructor(
    private bookingService: BookingService,
    private customerService: CustomerService
  ) {
    this.customer = this.customerService.getCurrentCustomer();
  }
  ngOnInit(): void {
    this.loadBookingStats();
    this.loadRecentBookings();
  }

  private loadBookingStats(): void {
    this.bookingService.getBookingStats().subscribe((stats: BookingStats) => {
      this.stats = stats;
      this.customerService.updateCustomerStats(stats.totalBookings, stats.totalSpent);
    });
  }

  private loadRecentBookings(): void {
    this.bookingService.getBookings().subscribe((bookings: Booking[]) => {
      this.recentBookings = bookings
        .sort((a: Booking, b: Booking) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);
    });
  }
}
