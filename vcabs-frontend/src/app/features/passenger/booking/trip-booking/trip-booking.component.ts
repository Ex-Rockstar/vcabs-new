import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { Cab, BookingDetails, Location, BookingType } from '../../models/booking.model';

@Component({
  selector: 'app-trip-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-booking.component.html',
  styleUrls: ['./trip-booking.component.css']
})
export class TripBookingComponent implements OnInit {
  tripType: 'single' | 'round' = 'single';
  pickupLocation: Location = { address: '', city: '', state: '', pincode: '' };
  dropLocation: Location = { address: '', city: '', state: '', pincode: '' };
  travelDate: string = '';
  travelTime: string = '';
  passengers: number = 1;
  specialRequests: string = '';
  
  availableCabs: Cab[] = [];
  selectedCab: Cab | null = null;
  
  showCabSelection = false;
  showConfirmation = false;
  
  estimatedDistance = 15;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.availableCabs = this.bookingService.getAvailableCabs();
    this.travelDate = this.today;
    this.travelTime = '09:00';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  isFormValid(): boolean {
    return !!(
      this.pickupLocation.address &&
      this.pickupLocation.city &&
      this.pickupLocation.pincode &&
      this.dropLocation.address &&
      this.dropLocation.city &&
      this.dropLocation.pincode &&
      this.travelDate &&
      this.travelTime
    );
  }

  proceedToCabSelection(): void {
    if (this.isFormValid()) {
      this.showCabSelection = true;
    }
  }

  selectCab(cab: Cab): void {
    this.selectedCab = cab;
  }

  calculatePrice(cab: Cab): number {
    if (!cab) return 0;
    return this.bookingService.calculatePrice(cab, this.estimatedDistance, this.tripType);
  }

  proceedToConfirmation(): void {
    if (this.selectedCab) {
      this.showConfirmation = true;
    }
  }

  confirmBooking(): void {
    if (!this.selectedCab) return;

    const bookingDetails: BookingDetails = {
      pickupLocation: this.pickupLocation,
      dropLocation: this.dropLocation,
      distance: this.estimatedDistance,
      estimatedDuration: 45,
      cab: this.selectedCab,
      tripType: this.tripType,
      bookingType: 'trip' as BookingType,
      totalAmount: this.calculatePrice(this.selectedCab),
      bookingDate: new Date(),
      travelDate: new Date(this.travelDate),
      travelTime: this.travelTime,
      passengers: this.passengers,
      specialRequests: this.specialRequests
    };

    this.bookingService.createBooking(bookingDetails).subscribe(booking => {
      this.router.navigate(['/passenger/booking-details', booking.id]);
    });
  }

  cancelBooking(): void {
    this.showConfirmation = false;
    this.showCabSelection = false;
    this.selectedCab = null;
  }
}


