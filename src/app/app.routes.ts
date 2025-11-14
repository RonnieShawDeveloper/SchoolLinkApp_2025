import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(c => c.LoginComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.DashboardComponent)
    },
    {
        path: 'attendance',
        loadComponent: () => import('./pages/attendance/attendance').then(c => c.AttendanceComponent)
    },
    {
        path: 'photo',
        loadComponent: () => import('./pages/photo/photo').then(c => c.PhotoComponent)
    },
    {
        path: 'install',
        loadComponent: () => import('./pages/install/install').then(c => c.InstallComponent)
    },
    {
        path: 'scanner/:school',
        loadComponent: () => import('./pages/scanner/scanner').then(c => c.ScannerComponent)
    },
    {
        path: 'live-reports',
        loadComponent: () => import('./pages/live-reports/live-reports').then(c => c.LiveReportsComponent)
    },
    {
        path: 'manual-entry',
        loadComponent: () => import('./pages/manual-entry/manual-entry').then(c => c.ManualEntryComponent)
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
