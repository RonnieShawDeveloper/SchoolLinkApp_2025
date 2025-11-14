import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { PwaService } from './services/pwa.service';
import { UpdateService } from './services/update.service';
import { InstallComponent } from './pages/install/install';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InstallComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'SchoolLink';
  isLoginPage = false;
  showInstallScreen = signal(true);

  constructor(
    public pwaService: PwaService,
    private updateService: UpdateService,
    private router: Router
  ) {
    this.updateService.initUpdateChecking();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage = event.urlAfterRedirects === '/login';
    });
  }

  ngOnInit(): void {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    this.showInstallScreen.set(!isStandalone);
  }

  logout(): void {
    // Implement logout logic here
    // e.g., clear tokens, navigate to login
    this.router.navigate(['/login']);
  }
}