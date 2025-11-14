import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'; // Import BsDatepickerModule
import { EmisService } from '../../services/emis.service';
import Swal from 'sweetalert2';

interface MockStudent {
  openemis_no: string;
  first_name: string;
  middle_name: string;
  third_name: string;
  last_name: string;
  gender_id: { key: number; value: string };
  date_of_birth: string;
  institution: { key: number; value: string };
  photo_content: string | null;
  status?: 'Present' | 'Absent' | 'Tardy';
  tardyReason?: string;
  attendanceHistory: { date: string, status: 'Present' | 'Absent' | 'Tardy', reason?: string }[];
}

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, BsDatepickerModule], // Add FormsModule and BsDatepickerModule here
  templateUrl: './manual-entry.html',
  styleUrl: './manual-entry.css',
})
export class ManualEntryComponent implements OnInit {
  currentView: 'search' | 'results' | 'student' = 'search'; // Add this property
  lastName: string = '';
  firstName: string = '';
  dob: string = '';
  foundStudents: MockStudent[] = [];
  selectedStudent: MockStudent | null = null;
  searched: boolean = false;

  constructor(private emisService: EmisService) {}

  ngOnInit(): void {
    // Optionally load all students on init or keep it empty until search
  }

  searchStudents(): void {
    this.selectedStudent = null; // Clear previous selection
    this.searched = true; // Set searched to true
    this.emisService.getStudents({
      lastName: this.lastName,
      firstName: this.firstName,
      dob: this.dob
    }).subscribe(students => {
      this.foundStudents = students;
      if (this.foundStudents.length > 0) {
        this.currentView = 'results'; // Show results if found
      } else {
        this.currentView = 'search'; // Stay on search view if no results
      }
    });
  }

  selectStudent(student: MockStudent): void {
    this.selectedStudent = student;
    this.currentView = 'student'; // Show student details view
  }

  newSearch(): void {
    this.lastName = '';
    this.firstName = '';
    this.dob = '';
    this.foundStudents = [];
    this.selectedStudent = null;
    this.searched = false;
    this.currentView = 'search'; // Go back to search view
  }

  async markAttendance(status: 'Present' | 'Absent' | 'Tardy'): Promise<void> {
    if (!this.selectedStudent) {
      Swal.fire('Error', 'Please select a student first.', 'error');
      return;
    }

    let reason: string | undefined;
    if (status === 'Tardy') {
      const { value: tardyReason } = await Swal.fire({
        title: 'Enter Tardy Reason',
        input: 'text',
        inputLabel: 'Reason',
        inputPlaceholder: 'e.g., Late Bus, Doctor\'s Note',
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return 'You need to write something!';
          }
          return null;
        }
      });

      if (tardyReason) {
        reason = tardyReason;
      } else {
        return; // User cancelled or didn't enter a reason
      }
    }

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    this.emisService.recordAttendance({
      student_openemis_no: this.selectedStudent.openemis_no,
      date: today,
      status: status,
      reason: reason
    }).subscribe(response => {
      if (response.success) {
        Swal.fire('Success', `Attendance marked as ${status} for ${this.selectedStudent?.first_name} ${this.selectedStudent?.last_name}.`, 'success');
        // Update the selected student's local attendance history for immediate feedback
        if (this.selectedStudent) {
          const newRecord = { date: today, status: status, reason: reason };
          this.selectedStudent.attendanceHistory.push(newRecord);
          this.selectedStudent.status = status;
          this.selectedStudent.tardyReason = status === 'Tardy' ? reason : undefined;
        }
      } else {
        Swal.fire('Error', 'Failed to record attendance.', 'error');
      }
    });
  }
}
