import { Component, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-install',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './install.html',
  styleUrls: ['./install.css']
})
export class InstallComponent {
  isDesktop = signal(!/Mobi/i.test(navigator.userAgent));
  canInstall;
  appInstalled;
  isContentCached;
  showInstallSuccess;

  constructor(private pwaService: PwaService) {
    this.canInstall = this.pwaService.canInstall;
    this.appInstalled = this.pwaService.appInstalled;
    this.isContentCached = this.pwaService.isContentCached;
    this.showInstallSuccess = computed(() => this.appInstalled() && this.isContentCached());

    effect(() => {
      if (this.showInstallSuccess()) {
        Swal.close();
      }
    });
  }

  installPwa(): void {
    Swal.fire({
      title: 'Installing Application',
      text: 'Please wait while the app is being installed on your device...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.pwaService.promptToInstall().then((choiceResult) => {
      if (choiceResult.outcome !== 'accepted') {
        // If user dismissed the prompt, close the "installing" dialog
        Swal.close();
      }
      // If accepted, the 'appinstalled' event will fire,
      // and the effect() will close the dialog once content is cached.
    }).catch(error => {
      // Handle cases where the prompt couldn't be shown
      console.error('Error prompting to install:', error);
      Swal.fire({
        icon: 'error',
        title: 'Installation Failed',
        text: 'Could not show the installation prompt. Please try the manual instructions.'
      });
    });
  }

  reset(): void {
    this.pwaService.resetInstallationStatus();
  }
}
