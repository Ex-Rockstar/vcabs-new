import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Booking, BookingDetails, Cab, BookingStats } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  private availableCabs: Cab[] = [
    {
      id: '1',
      type: '4-seater',
      name: 'Economy Sedan',
      basePrice: 50,
      pricePerKm: 12,
      image: '/assets/cab-4-seater.jpg',
      features: ['AC', 'Music System', 'GPS']
    },
    {
      id: '2',
      type: '6-seater',
      name: 'SUV',
      basePrice: 80,
      pricePerKm: 18,
      image: '/assets/cab-6-seater.jpg',
      features: ['AC', 'Music System', 'GPS', 'Extra Space']
    },
    {
      id: '3',
      type: '8-seater',
      name: 'Mini Bus',
      basePrice: 120,
      pricePerKm: 25,
      image: '/assets/cab-8-seater.jpg',
      features: ['AC', 'Music System', 'GPS', 'Extra Space', 'Luggage Space']
    }
  ];

  constructor() {
    this.loadSampleBookings();
  }

  getAvailableCabs(): Cab[] {
    return this.availableCabs;
  }

  getCabById(id: string): Cab | undefined {
    return this.availableCabs.find(cab => cab.id === id);
  }

  calculatePrice(cab: Cab, distance: number, tripType: 'single' | 'round'): number {
    const basePrice = cab.basePrice;
    const distancePrice = distance * cab.pricePerKm;
    const totalPrice = basePrice + distancePrice;
    return tripType === 'round' ? totalPrice * 2 : totalPrice;
  }

  createBooking(bookingDetails: BookingDetails): Observable<Booking> {
    return new Observable(observer => {
      const booking: Booking = {
        id: this.generateBookingId(),
        customerId: 'customer-1',
        bookingDetails,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentStatus: 'pending'
      };

      const currentBookings = this.bookingsSubject.value;
      this.bookingsSubject.next([...currentBookings, booking]);

      observer.next(booking);
      observer.complete();
    });
  }

  confirmBooking(bookingId: string): Observable<Booking> {
    return new Observable(observer => {
      const bookings = this.bookingsSubject.value;
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);

      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'confirmed';
        bookings[bookingIndex].updatedAt = new Date();
        this.bookingsSubject.next([...bookings]);
        observer.next(bookings[bookingIndex]);
      }
      observer.complete();
    });
  }

  cancelBooking(bookingId: string): Observable<Booking> {
    return new Observable(observer => {
      const bookings = this.bookingsSubject.value;
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);

      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = 'cancelled';
        bookings[bookingIndex].updatedAt = new Date();
        this.bookingsSubject.next([...bookings]);
        observer.next(bookings[bookingIndex]);
      }
      observer.complete();
    });
  }

  getBookings(): Observable<Booking[]> {
    return this.bookingsSubject.asObservable();
  }

  getBookingById(id: string): Observable<Booking | undefined> {
    return new Observable(observer => {
      const booking = this.bookingsSubject.value.find(b => b.id === id);
      observer.next(booking);
      observer.complete();
    });
  }

  getBookingStats(): Observable<BookingStats> {
    return new Observable(observer => {
      const bookings = this.bookingsSubject.value;
      const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');

      const stats: BookingStats = {
        totalBookings: confirmedBookings.length,
        totalSpent: confirmedBookings.reduce((sum, b) => sum + b.bookingDetails.totalAmount, 0),
        averageBookingValue: confirmedBookings.length > 0 ?
          confirmedBookings.reduce((sum, b) => sum + b.bookingDetails.totalAmount, 0) / confirmedBookings.length : 0,
        favoriteCabType: this.getMostUsedCabType(confirmedBookings),
        lastBookingDate: confirmedBookings.length > 0 ?
          new Date(Math.max(...confirmedBookings.map(b => b.createdAt.getTime()))) : new Date(),
        bookingsByType: {
          trip: confirmedBookings.filter(b => b.bookingDetails.bookingType === 'trip').length,
          intercity: confirmedBookings.filter(b => b.bookingDetails.bookingType === 'intercity').length,
          rental: confirmedBookings.filter(b => b.bookingDetails.bookingType === 'rental').length,
          reserve: confirmedBookings.filter(b => b.bookingDetails.bookingType === 'reserve').length
        }
      };

      observer.next(stats);
      observer.complete();
    });
  }

  private generateBookingId(): string {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  private getMostUsedCabType(bookings: Booking[]): string {
    const cabTypeCount = bookings.reduce((acc, booking) => {
      const cabType = booking.bookingDetails.cab.type;
      acc[cabType] = (acc[cabType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(cabTypeCount).reduce((a, b) =>
      cabTypeCount[a] > cabTypeCount[b] ? a : b, '4-seater'
    );
  }

  private loadSampleBookings(): void {
    const sampleBookings: Booking[] = [
      {
        id: 'BK001',
        customerId: 'customer-1',
        bookingDetails: {
          pickupLocation: {
            address: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          dropLocation: {
            address: '456 Business District',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400002'
          },
          distance: 15,
          estimatedDuration: 45,
          cab: this.availableCabs[0],
          tripType: 'single',
          bookingType: 'trip',
          totalAmount: 230,
          bookingDate: new Date('2024-01-15'),
          travelDate: new Date('2024-01-16'),
          travelTime: '09:00',
          passengers: 2
        },
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-16'),
        paymentStatus: 'paid'
      }
    ];

    this.bookingsSubject.next(sampleBookings);
  }
}


