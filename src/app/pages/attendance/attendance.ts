import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmisService } from '../../services/emis.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class AttendanceComponent implements OnInit {
  schools: string[] = [];
  selectedSchool = '';

  constructor(private router: Router, private emisService: EmisService) {}

  ngOnInit(): void {
    Swal.fire({
      title: 'Loading Schools',
      text: 'Please wait while we fetch the list of schools from the EMIS.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.emisService.getSchools().subscribe((schools) => {
      this.schools = schools;
      Swal.close();
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  startScanning(): void {
    if (this.selectedSchool) {
      this.router.navigate(['/scanner', this.selectedSchool]);
    }
  }
}
