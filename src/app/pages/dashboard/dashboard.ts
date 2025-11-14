import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {

  constructor(private router: Router) {}

  goToScanner(): void {
    this.router.navigate(['/attendance']);
  }

  goToPhotos(): void {
    this.router.navigate(['/photo']);
  }

  goToLiveReports(): void {
    this.router.navigate(['/live-reports']);
  }

  goToManualEntry(): void {
    this.router.navigate(['/manual-entry']);
  }
}
