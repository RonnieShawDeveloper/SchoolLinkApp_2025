import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  private updateSubscription: Subscription | undefined;
  private checkInterval = 60 * 1000; // 60 seconds

  constructor(private swUpdate: SwUpdate) {}

  public initUpdateChecking(): void {
    if (this.swUpdate.isEnabled) {
      this.startUpdateCheck();
      this.swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          this.promptUpdate();
        }
      });
    }
  }

  private startUpdateCheck(): void {
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = interval(this.checkInterval).subscribe(() => {
      this.swUpdate.checkForUpdate();
    });
  }

  private promptUpdate(): void {
    this.updateSubscription?.unsubscribe(); // Stop checking for updates while the dialog is open
    Swal.fire({
      title: 'Update Available',
      text: 'A new version of the application is available. Would you like to update now?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Update Now',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.swUpdate.activateUpdate().then(() => document.location.reload());
      } else {
        this.handleUpdateCancellation();
      }
    });
  }

  private handleUpdateCancellation(): void {
    Swal.fire({
      title: 'Update Later',
      text: 'You can continue using the current version. The update will be applied the next time you restart the app.',
      icon: 'info'
    });
    this.checkInterval = 60 * 60 * 1000; // 60 minutes
    this.startUpdateCheck();
  }
}
