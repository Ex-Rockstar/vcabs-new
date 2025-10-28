import { Booking, BookingDetails } from './booking.model';

describe('Booking Model', () => {
  it('should create a booking object correctly', () => {
    const bookingDetails: BookingDetails = {
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
      cab: {
        id: '1',
        type: '4-seater',
        name: 'Economy Sedan',
        basePrice: 50,
        pricePerKm: 12,
        image: '/assets/cab-4-seater.jpg',
        features: ['AC', 'Music System', 'GPS']
      },
      tripType: 'single',
      bookingType: 'trip',
      totalAmount: 230,
      bookingDate: new Date('2024-01-15'),
      travelDate: new Date('2024-01-16'),
      travelTime: '09:00',
      passengers: 2
    };

    const booking: Booking = {
      id: 'BK001',
      customerId: 'customer-1',
      bookingDetails: bookingDetails,
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16'),
      paymentStatus: 'paid'
    };

    expect(booking).toBeTruthy();
    expect(booking.bookingDetails.pickupLocation.city).toBe('Mumbai');
    expect(booking.status).toBe('completed');
  });
});
