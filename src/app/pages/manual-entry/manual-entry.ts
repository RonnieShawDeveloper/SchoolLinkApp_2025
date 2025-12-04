import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { EmisService, Student } from '../../services/emis.service';
import Swal from 'sweetalert2';
import { DatePickerComponent } from '../../components/date-picker/date-picker';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent], // Add FormsModule and custom DatePicker
  templateUrl: './manual-entry.html',
  styleUrl: './manual-entry.css',
})
export class ManualEntryComponent implements OnInit {
  currentView: 'search' | 'results' | 'student' = 'search'; // Add this property
  lastName: string = '';
  firstName: string = '';
  dob: string = '';
  foundStudents: Student[] = [];
  selectedStudent: Student | null = null;
  searched: boolean = false;
  selectedSchool: string | null = null;
  fromScanner = false;

  constructor(private emisService: EmisService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.selectedSchool = params.get('school');
      this.fromScanner = params.get('fromScanner') === 'true';
    });
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

  selectStudent(student: Student): void {
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

    // If selected school context exists and doesn't match student's school, require a reason
    if (this.selectedSchool && this.selectedStudent.institution.value !== this.selectedSchool) {
      const { value: mismatchReason } = await Swal.fire({
        title: 'School Mismatch',
        html: `The selected location is <b>${this.selectedSchool}</b>, but the student is enrolled at <b>${this.selectedStudent.institution.value}</b>.<br/><br/>Please provide a reason (e.g., Visiting, Transferring).`,
        input: 'text',
        inputLabel: 'Reason',
        inputPlaceholder: 'Visiting / Transferring / Special permission',
        showCancelButton: true,
        confirmButtonText: 'Continue',
        inputValidator: (value) => {
          if (!value) { return 'Reason is required to proceed.'; }
          return null;
        }
      });
      if (!mismatchReason) { return; }
      reason = reason ? `${reason}; ${mismatchReason}` : mismatchReason;
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

        // If came from scanner flow, return to scanner for the same school
        if (this.fromScanner && this.selectedSchool) {
          this.router.navigate(['/scanner', this.selectedSchool]);
        }
      } else {
        Swal.fire('Error', 'Failed to record attendance.', 'error');
      }
    });
  }
}
