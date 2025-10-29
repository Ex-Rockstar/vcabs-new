import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OtpService } from '../../../core/services/otp.service';

@Component({
  selector: 'vcabs-driver-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './driver-register.html',
  styleUrls: ['./driver-register.css']
})
export class DriverRegister {
  form: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  otpSent = false;
  otpVerified = false;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService, private otpSvc: OtpService, private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      vehicleNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{6,10}$/)]],
      licenseNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,15}$/)]],
      otp: ['', [Validators.pattern(/^[0-9]{4,6}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.otpVerified) { this.errorMessage = 'Please verify OTP before signing up'; return; }
    this.isLoading = true;
    const payload = {
      userName: this.form.value.name,
      email: this.form.value.email,
      phoneNumber: this.form.value.contactNo,
      password: this.form.value.password,
      role: 'DRIVER' as const,
      otp: this.form.value.otp,
      driverDetails: {
        licenseNumber: this.form.value.licenseNumber,
        vehicleNumber: this.form.value.vehicleNumber
      }
    };
    this.auth.register(payload as any).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: (err) => { this.errorMessage = err?.error?.message || 'Registration failed'; this.isLoading = false; },
      complete: () => { this.isLoading = false; }
    });
  }

  sendOtp() {
    const email = this.form.value.email;
    if (!email || this.form.get('email')?.invalid) return;
    this.otpSent = false; this.otpVerified = false;
    this.otpSvc.send(email).subscribe({
      next: () => { this.otpSent = true; this.cdr.detectChanges(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to send OTP'; this.cdr.detectChanges(); }
    });
  }

  verifyOtp() {
    const email = this.form.value.email;
    const otp = this.form.value.otp;
    if (!email || !otp) return;
    this.otpSvc.verify(email, otp).subscribe({
      next: (ok) => { this.otpVerified = !!ok; if (!ok) this.errorMessage = 'Invalid OTP'; this.cdr.detectChanges(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'OTP verification failed'; this.otpVerified = false; this.cdr.detectChanges(); }
    });
  }
}
