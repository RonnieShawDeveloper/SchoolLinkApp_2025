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
  schoolName: string | null = null;
  scannerEnabled = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emisService: EmisService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.schoolName = this.route.snapshot.paramMap.get('school');
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
          confirmButtonText: 'Accept',
          cancelButtonText: 'Reject',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('Student accepted');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            console.log('Student rejected');
          }
          // Re-enable scanner for the next scan
          setTimeout(() => {
            this.scannerEnabled = true;
            this.changeDetectorRef.detectChanges();
          }, 500); // 500ms delay
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not verify student. Please try again.',
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
}