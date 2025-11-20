import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { PwaService } from './services/pwa.service';
import { UpdateService } from './services/update.service';
import { InstallComponent } from './pages/install/install';
import { AnimatedBackgroundComponent } from './components/animated-background/animated-background';
import { filter } from 'rxjs';
import { trigger, transition, style, animate, query, group, animateChild } from '@angular/animations'; // Enhanced animations

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, InstallComponent, AnimatedBackgroundComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ position: 'relative', perspective: '1200px' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          })
        ], { optional: true }),
        // Start states
        query(':enter', [
          style({
            opacity: 0,
            transform: 'translate3d(0, 24px, 0) scale(0.98)'
          })
        ], { optional: true }),
        query(':leave', [
          style({
            opacity: 1,
            transform: 'translate3d(0, 0, 0) scale(1)'
          })
        ], { optional: true }),
        // Animate out the old view while animating in the new one
        group([
          query(':leave', [
            animate('450ms cubic-bezier(0.22, 1, 0.36, 1)',
              style({
                opacity: 0,
                filter: 'blur(6px)',
                transform: 'translate3d(0, -24px, -40px) scale(0.96)'
              })
            )
          ], { optional: true }),
          query(':enter', [
            animate('600ms 50ms cubic-bezier(0.22, 1, 0.36, 1)',
              style({
                opacity: 1,
                filter: 'blur(0)',
                transform: 'translate3d(0, 0, 0) scale(1)'
              })
            )
          ], { optional: true })
        ]),
        // Run child animations, if any
        query('@*', animateChild(), { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title = 'SchoolLink';
  isLoginPage = false;
  showInstallScreen = signal(true);

  constructor(
    public pwaService: PwaService,
    private updateService: UpdateService,
    private router: Router
  ) { // Removed NavigationDirectionService injection
    this.updateService.initUpdateChecking();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginPage = event.urlAfterRedirects === '/login';
    });
  }

  ngOnInit(): void {
    const isDesktop = !/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    // Desktop: always show desktop block screen
    if (isDesktop) {
      this.showInstallScreen.set(true);
      return;
    }
    // Mobile: only allow app if running as standalone (PWA)
    if (isStandalone) {
      this.showInstallScreen.set(false); // Show the app
    } else {
      this.showInstallScreen.set(true); // Show install instructions
    }
  }

  logout(): void {
    // Implement logout logic here
    // e.g., clear tokens, navigate to login
    this.router.navigate(['/login']);
  }

  prepareRoute(outlet: RouterOutlet) {
    // Use activatedRouteData which is designed for this purpose and includes the resolved data.
    // Return a default string if animation data is not found to ensure a valid state for the animation trigger.
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'] ?
      outlet.activatedRouteData['animation'] : 'default';
  }
}
