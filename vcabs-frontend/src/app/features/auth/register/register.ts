import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'vcabs-register',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  constructor(private router: Router) {}

  goToAdmin() { this.router.navigate(['/auth/register/admin']); }
  goToDriver() { this.router.navigate(['/auth/register/driver']); }
  goToCustomer() { this.router.navigate(['/auth/register/customer']); }
}
