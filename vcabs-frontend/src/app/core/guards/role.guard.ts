import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';

export function RoleGuard(allowed: string[]): CanMatchFn {
  return (route: Route, segments: UrlSegment[]) => {
    const router = inject(Router);
    const role = localStorage.getItem('role');
    if (!role || !allowed.includes(role)) {
      router.navigate(['/auth/login']);
      return false;
    }
    return true;
  };
}
