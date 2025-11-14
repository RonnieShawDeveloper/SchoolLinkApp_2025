import { Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private deferredPrompt: any = null;
  public canInstall = signal(false);
  public appInstalled = signal(localStorage.getItem('pwa_installed') === 'true');
  public isContentCached = signal(false);

  constructor(private swUpdate: SwUpdate) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        this.isContentCached.set(true);
      });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (!this.appInstalled()) {
        this.canInstall.set(true);
      }
    });

    window.addEventListener('appinstalled', () => {
      this.canInstall.set(false);
      this.appInstalled.set(true);
      localStorage.setItem('pwa_installed', 'true');
      this.deferredPrompt = null;
      console.log('PWA was installed');
    });
  }

  public promptToInstall(): Promise<{ outcome: string }> {
    if (!this.deferredPrompt) {
      return Promise.reject(new Error('Installation prompt not available.'));
    }
    this.deferredPrompt.prompt();
    return this.deferredPrompt.userChoice;
  }

  public resetInstallationStatus(): void {
    localStorage.removeItem('pwa_installed');
    this.appInstalled.set(false);
    window.location.reload();
  }
}
