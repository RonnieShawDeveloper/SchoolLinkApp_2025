import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmisService } from '../../services/emis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent implements OnInit {
  schools: { id: number, name: string }[] = [];
  selectedSchool: { id: number, name: string } | null = null;

  constructor(
    private router: Router,
    private emisService: EmisService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    Swal.fire({
      title: 'Loading Schools',
      text: 'Please wait while we fetch the list of schools from the EMIS.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.emisService.getSchools().subscribe({
      next: (schools) => {
        console.log('[AttendanceComponent] Received schools:', schools.length);
        // Run inside Angular's zone to ensure change detection
        this.ngZone.run(() => {
          this.schools = schools;
          this.cdr.detectChanges();
          console.log('[AttendanceComponent] Schools assigned and change detected');
        });
        Swal.close();
      },
      error: (err) => {
        console.error('[AttendanceComponent] Error loading schools:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Schools',
          text: err.message
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  startScanning(): void {
    if (this.selectedSchool) {
      this.router.navigate(['/scanner', this.selectedSchool.id], { queryParams: { name: this.selectedSchool.name } });
    }
  }
}
