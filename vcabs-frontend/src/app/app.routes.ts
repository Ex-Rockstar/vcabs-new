import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'auth', 
        loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
    },  
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin-module').then(m => m.AdminModule),
        canMatch: [AuthGuard, RoleGuard(['ADMIN'])]
    },
    {
        path: 'driver',
        loadChildren: () => import('./features/driver/driver-module').then(m => m.DriverRoutingModule),
        canMatch: [AuthGuard, RoleGuard(['DRIVER'])]
    },
    {
        path: 'passenger',
        loadChildren: () => import('./features/passenger/passenger-module').then(m => m.PassengerModule),
        canMatch: [AuthGuard, RoleGuard(['CUSTOMER'])]
    },
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    }
];
