import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationDirectionService {
  private history: string[] = [];
  private isBack = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      if (this.history.length > 0 && this.history[this.history.length - 1] === url) {
        // Navigating back
        this.history.pop();
        this.isBack = true;
      } else {
        // Navigating forward or to a new path
        this.history.push(url);
        this.isBack = false;
      }
    });
  }

  getDirection(): 'forward' | 'back' | 'none' {
    if (this.isBack) {
      return 'back';
    } else if (this.history.length > 1) { // More than one item means we've moved forward at least once
      return 'forward';
    }
    return 'none'; // Initial load or only one page in history
  }
}
