import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(c => c.LoginComponent),
        data: { animation: 'LoginPage' }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.DashboardComponent),
        data: { animation: 'DashboardPage' }
    },
    {
        path: 'attendance',
        loadComponent: () => import('./pages/attendance/attendance').then(c => c.AttendanceComponent),
        data: { animation: 'AttendancePage' }
    },
    {
        path: 'photo',
        loadComponent: () => import('./pages/photo/photo').then(c => c.PhotoComponent),
        data: { animation: 'PhotoPage' }
    },
    {
        path: 'install',
        loadComponent: () => import('./pages/install/install').then(c => c.InstallComponent),
        data: { animation: 'InstallPage' }
    },
    {
        path: 'scanner/:schoolId',
        loadComponent: () => import('./pages/scanner/scanner').then(c => c.ScannerComponent),
        data: { animation: 'ScannerPage' }
    },
    {
        path: 'live-reports',
        loadComponent: () => import('./pages/live-reports/live-reports').then(c => c.LiveReportsComponent),
        data: { animation: 'LiveReportsPage' }
    },
    {
        path: 'manual-entry',
        loadComponent: () => import('./pages/manual-entry/manual-entry').then(c => c.ManualEntryComponent),
        data: { animation: 'ManualEntryPage' }
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
        data: { animation: 'LoginPage' }
    }
];
