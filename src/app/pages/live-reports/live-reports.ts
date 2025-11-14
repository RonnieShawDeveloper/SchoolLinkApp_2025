import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-live-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-reports.html',
  styleUrl: './live-reports.css',
})
export class LiveReportsComponent implements OnInit {
  allStudents: MockStudent[] = [];
  presentCount: number = 0;
  absentCount: number = 0;
  tardyCount: number = 0;
  absentStudents: MockStudent[] = [];
  tardyStudents: MockStudent[] = [];

  constructor(private emisService: EmisService) {}

  ngOnInit(): void {
    this.loadReports();
    // Optional: Implement a real-time update mechanism
    // setInterval(() => this.loadReports(), 30000); // Update every 30 seconds
  }

  loadReports(): void {
    this.emisService.getStudentsList().subscribe(students => {
      this.allStudents = students;
      this.calculateStatistics();
    });
  }

  calculateStatistics(): void {
    this.presentCount = 0;
    this.absentCount = 0;
    this.tardyCount = 0;
    this.absentStudents = [];
    this.tardyStudents = [];

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    this.allStudents.forEach(student => {
      const todayAttendance = student.attendanceHistory.find(record => record.date === today);

      if (todayAttendance) {
        if (todayAttendance.status === 'Present') {
          this.presentCount++;
        } else if (todayAttendance.status === 'Absent') {
          this.absentCount++;
          this.absentStudents.push(student);
        } else if (todayAttendance.status === 'Tardy') {
          this.tardyCount++;
          this.tardyStudents.push(student);
        }
      } else {
        // If no record for today, assume absent for reporting purposes
        this.absentCount++;
        this.absentStudents.push(student);
      }
    });
  }

  showStudentDetails(student: MockStudent): void {
    let attendanceHistoryHtml = '<ul>';
    student.attendanceHistory.forEach(record => {
      attendanceHistoryHtml += `<li>${record.date}: ${record.status} ${record.reason ? '(' + record.reason + ')' : ''}</li>`;
    });
    attendanceHistoryHtml += '</ul>';

    Swal.fire({
      title: `${student.first_name} ${student.last_name}'s Attendance`,
      html: attendanceHistoryHtml,
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }
}
