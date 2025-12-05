import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { EmisService } from '../../services/emis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './scanner.html',
  styleUrls: ['./scanner.css']
})
export class ScannerComponent implements OnInit {
  schoolId: number | null = null;
  schoolName: string | null = null;
  scannerEnabled = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emisService: EmisService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('schoolId');
    this.schoolId = idParam ? +idParam : null;
    this.schoolName = this.route.snapshot.queryParamMap.get('name');
  }

  scanSuccess(qrCodeData: string): void {
    if (!this.scannerEnabled) {
      return;
    }
    this.scannerEnabled = false;
    this.changeDetectorRef.detectChanges();

    Swal.fire({
      title: 'Verifying Student',
      text: 'Please wait while we verify the student\'s information.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.emisService.verifyStudent(qrCodeData, this.schoolName || '').subscribe({
      next: student => {
        Swal.close();
        const imageUrl = 'images/student-test-photo.jpg';
        Swal.fire({
          title: `${student.first_name} ${student.last_name}`,
          text: `Enrolled at: ${student.institution.value}`,
          imageUrl: imageUrl,
          imageWidth: 200,
          imageHeight: 200,
          imageAlt: 'Student Photo',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: 'Check-In',
          denyButtonText: 'Tardy',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then(async (result) => {
          if (result.isConfirmed) {
            // If school mismatch (compare IDs), require reason
            if (this.schoolId && student.institution.key !== this.schoolId) {
              const { value: reason } = await Swal.fire({
                title: 'School Mismatch',
                html: `Current location: <b>${this.schoolName}</b><br/>Student enrolled at: <b>${student.institution.value}</b><br/><br/>Provide reason (Visiting, Transferring, etc.)`,
                input: 'text',
                inputPlaceholder: 'Reason required',
                showCancelButton: true,
                confirmButtonText: 'Record',
                inputValidator: (value) => {
                  if (!value) return 'Reason is required';
                  return null;
                }
              });
              if (!reason) {
                // User cancelled; just re-enable scanner below
              } else {
                const today = new Date().toISOString().slice(0, 10);
                this.emisService.recordAttendance({
                  student_openemis_no: student.openemis_no,
                  date: today,
                  status: 'Present',
                  reason: reason
                }).subscribe();
              }
            } else {
              // Record attendance as Present without extra reason
              const today = new Date().toISOString().slice(0, 10);
              this.emisService.recordAttendance({
                student_openemis_no: student.openemis_no,
                date: today,
                status: 'Present'
              }).subscribe();
            }
          } else if (result.isDenied) {
            // Mark as Tardy; require tardy reason, also handle school mismatch reason
            const { value: tardyReason } = await Swal.fire({
              title: 'Tardy Reason',
              input: 'text',
              inputPlaceholder: 'e.g., Late Bus, Appointment, Traffic',
              showCancelButton: true,
              confirmButtonText: 'Continue',
              inputValidator: (value) => {
                if (!value) return 'Reason is required for Tardy';
                return null;
              }
            });
            if (!tardyReason) {
              // cancelled entering tardy reason; do nothing further
            } else {
              let finalReason = tardyReason;
              if (this.schoolId && student.institution.key !== this.schoolId) {
                const { value: mismatchReason } = await Swal.fire({
                  title: 'School Mismatch',
                  html: `Current location: <b>${this.schoolName}</b><br/>Student enrolled at: <b>${student.institution.value}</b><br/><br/>Provide reason (Visiting, Transferring, etc.)`,
                  input: 'text',
                  inputPlaceholder: 'Reason required',
                  showCancelButton: true,
                  confirmButtonText: 'Record',
                  inputValidator: (value) => {
                    if (!value) return 'Reason is required';
                    return null;
                  }
                });
                if (!mismatchReason) {
                  // cancelled mismatch reason; abort recording
                } else {
                  finalReason = `${tardyReason}; ${mismatchReason}`;
                  const today = new Date().toISOString().slice(0, 10);
                  this.emisService.recordAttendance({
                    student_openemis_no: student.openemis_no,
                    date: today,
                    status: 'Tardy',
                    reason: finalReason
                  }).subscribe();
                }
              } else {
                const today = new Date().toISOString().slice(0, 10);
                this.emisService.recordAttendance({
                  student_openemis_no: student.openemis_no,
                  date: today,
                  status: 'Tardy',
                  reason: finalReason
                }).subscribe();
              }
            }
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Cancel: do nothing, just close and resume scanning
          }
          // Re-enable scanner for the next scan
          setTimeout(() => {
            this.scannerEnabled = true;
            this.changeDetectorRef.detectChanges();
          }, 500); // 500ms delay
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Scan Failed',
          text: err.message || 'Could not verify student. Please try again.',
        }).then(() => {
          setTimeout(() => {
            this.scannerEnabled = true;
            this.changeDetectorRef.detectChanges();
          }, 500); // 500ms delay
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/attendance']);
  }

  goToManualEntry(): void {
    const school = this.schoolName || '';
    // Pause scanner to release camera while navigating
    this.scannerEnabled = false;
    this.router.navigate(['/manual-entry'], { queryParams: { school, fromScanner: true } });
  }

  exitToDashboard(): void {
    // Disable scanner and go back to dashboard
    this.scannerEnabled = false;
    this.router.navigate(['/dashboard']);
  }
}
