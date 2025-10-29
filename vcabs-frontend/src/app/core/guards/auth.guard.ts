import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment, Route } from '@angular/router';

export const AuthGuard: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }
  return true;
};
