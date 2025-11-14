import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router'; // Import ActivatedRoute
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ZXingScannerModule, ZXingScannerComponent } from '@zxing/ngx-scanner';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { EmisService } from '../../services/emis.service';

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ZXingScannerModule, BsDatepickerModule],
  templateUrl: './photo.html',
  styleUrl: './photo.css',
})
export class PhotoComponent implements OnInit {
  currentView: 'search' | 'student' | 'capture' = 'search';
  search = {
    lastName: '',
    firstName: '',
    dob: ''
  };
  searchResults: any[] = [];
  searched = false;
  showSearchResults = false; // New property to control visibility
  selectedStudent: any = null;
  studentPhoto: SafeUrl | null = null; // Change to allow null
  newPhoto: string | null = null;

  availableDevices!: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo | undefined;

  @ViewChild('scanner') scanner!: ZXingScannerComponent;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute
    private router: Router,
    private sanitizer: DomSanitizer,
    private emisService: EmisService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const openemis_no = params.get('openemis_no');
      if (openemis_no) {
        this.emisService.getStudentDetailsByEmisNo(openemis_no).subscribe(details => {
          if (details) {
            this.selectedStudent = details;
            if (this.selectedStudent.photo_content) {
              this.studentPhoto = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + this.selectedStudent.photo_content);
            } else {
              this.studentPhoto = null;
            }
            this.currentView = 'student';
          } else {
            // Handle case where student is not found
            Swal.fire('Error', 'Student not found.', 'error');
            this.router.navigate(['/dashboard']); // Redirect to dashboard or search
          }
        });
      }
    });
  }

  searchStudents(): void {
    this.searched = true;
    this.showSearchResults = false; // Hide previous results
    if (!this.search.lastName && !this.search.firstName && !this.search.dob) {
      this.searchResults = [];
      return;
    }

    this.emisService.getStudents(this.search).subscribe(students => {
      this.searchResults = students;
      this.showSearchResults = true; // Show results section
    });
  }

  selectStudent(student: any): void {
    this.emisService.getStudentDetails(student.openemis_no).subscribe(details => {
      this.selectedStudent = details;
      if (this.selectedStudent.photo_content) {
        this.studentPhoto = this.sanitizer.bypassSecurityTrustUrl('data:image/jpeg;base64,' + this.selectedStudent.photo_content);
      } else {
        this.studentPhoto = null; // Set to null if no photo content
      }
      this.currentView = 'student';
      this.showSearchResults = false; // Hide results when student is selected
    });
  }

  goBackToSearch(): void {
    this.currentView = 'search';
    this.selectedStudent = null;
    this.studentPhoto = null; // Clear studentPhoto
    this.newPhoto = null;
    this.search = { lastName: '', firstName: '', dob: '' };
    this.searchResults = [];
    this.searched = false;
    this.showSearchResults = false; // Ensure search results are hidden
  }

  newSearch(): void {
    this.goBackToSearch(); // Reuse existing logic to reset and go to search view
  }

  showCaptureView(): void {
    this.currentView = 'capture';
  }

  hideCaptureView(): void {
    this.currentView = 'student';
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.selectedDevice = devices.find(d => d.kind === 'videoinput');
  }

  onScanError(error: Error): void {
    console.error('Scan error:', error);
  }

  capturePhoto(): void {
    const video = this.scanner.previewElemRef.nativeElement;
    const canvasEl = this.canvas.nativeElement;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    canvasEl.width = 400;
    canvasEl.height = 400;

    const context = canvasEl.getContext('2d');
    if(context && this.selectedStudent){ // Add null check for selectedStudent
      context.drawImage(video, sx, sy, size, size, 0, 0, canvasEl.width, canvasEl.height);
      this.newPhoto = canvasEl.toDataURL('image/jpeg').split(',')[1]; // Get base64 string
      this.studentPhoto = this.sanitizer.bypassSecurityTrustUrl(canvasEl.toDataURL('image/jpeg'));
      this.selectedStudent.photo_content = this.newPhoto; // Update selected student's photo content
    }
    this.hideCaptureView();
  }

  savePhoto(): void {
    if (!this.newPhoto || !this.selectedStudent) {
      return;
    }

    this.emisService.updateStudentPhoto(this.selectedStudent.openemis_no, this.newPhoto).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire('Success', 'Photo saved successfully!', 'success');
          this.newPhoto = null;
          this.goBackToSearch(); // Navigate back to search page after saving
        } else {
          Swal.fire('Error', 'Could not save photo.', 'error');
        }
      },
      error: (err) => {
        console.error('Error saving photo', err);
        Swal.fire('Error', 'An unexpected error occurred while saving the photo.', 'error');
      }
    });
  }
}