import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, firstValueFrom } from 'rxjs';
import { catchError, map, tap, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

// Interfaces matching the App's needs (mapped from API)
export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Tardy';
  reason?: string;
}

export interface Student {
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
  attendanceHistory: AttendanceRecord[];
}

@Injectable({
  providedIn: 'root'
})
export class EmisService {

  // Cloud Function Base URL
  // In production, this should be relative '/api' if hosted on Firebase,
  // or the full URL. Using full URL for now to support local dev if needed.
  private apiUrl = 'https://us-central1-bbms-1283c.cloudfunctions.net/api';

  private token: string | null = null;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ data: { token: string } }>(`${this.apiUrl}/login`, { username, password }).pipe(
      map(response => {
        const token = response.data.token;
        this.token = token;
        return { token };
      }),
      catchError(this.handleError)
    );
  }

  getSchools(): Observable<string[]> {
    if (!this.token) {
      return throwError(() => new Error('Not authenticated'));
    }
    const headers = new HttpHeaders().set('Authorization', this.token);

    // Fetch all institutions. Might need pagination handling if > 100.
    // For now, requesting a large limit.
    const params = new HttpParams().set('limit', '1000');

    return this.http.get<any>(`${this.apiUrl}/emis/institutions`, { headers, params }).pipe(
      map(response => {
        // Map API response to simple string array of school names as expected by component
        const institutions = response.data.data;
        return institutions.map((inst: any) => inst.name).sort();
      }),
      catchError(this.handleError)
    );
  }

  // Search students
  getStudents(searchCriteria?: { lastName?: string, firstName?: string, dob?: string, openemis_no?: string }): Observable<Student[]> {
    if (!this.token) {
      return throwError(() => new Error('Not authenticated'));
    }
    Swal.fire({ title: 'Searching Students...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const headers = new HttpHeaders().set('Authorization', this.token);
    let params = new HttpParams().set('limit', '50'); // Limit results

    // Note: The OpenEMIS API documentation provided didn't explicitly detail search parameters 
    // beyond pagination. We are assuming standard query params might work or the Proxy 
    // needs to handle it. If the API filters by these keys, this will work.
    if (searchCriteria) {
      if (searchCriteria.openemis_no) params = params.set('openemis_no', searchCriteria.openemis_no);
      if (searchCriteria.firstName) params = params.set('first_name', searchCriteria.firstName);
      if (searchCriteria.lastName) params = params.set('last_name', searchCriteria.lastName);
      // Date format might need adjustment
      if (searchCriteria.dob) params = params.set('date_of_birth', searchCriteria.dob);
    }

    return this.http.get<any>(`${this.apiUrl}/emis/institutions/students`, { headers, params }).pipe(
      map(response => {
        const apiStudents = response.data.data;
        return apiStudents.map(this.mapApiStudentToAppStudent);
      }),
      finalize(() => Swal.close()),
      catchError(this.handleError)
    );
  }

  getStudentsList(): Observable<Student[]> {
    return this.getStudents();
  }

  getStudentDetailsByEmisNo(openemis_no: string): Observable<Student | undefined> {
    // Reuse getStudents with specific filter
    return this.getStudents({ openemis_no }).pipe(
      map(students => students.find(s => s.openemis_no === openemis_no))
    );
  }

  recordAttendance(attendanceData: { student_openemis_no: string, date: string, status: 'Present' | 'Absent' | 'Tardy', reason?: string }): Observable<{ success: boolean }> {
    Swal.fire({ title: 'Recording Attendance...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    // Mapping App status to LMS expected payload
    // LMS expects: date, student_openemis_no, period (1 or 2), is_late (boolean)
    // We default to period 1 as per requirements ("Period 1 Homeroom class")

    const payload: any = {
      date: attendanceData.date,
      student_openemis_no: attendanceData.student_openemis_no,
      period: 1, // Defaulting to Period 1
      is_late: attendanceData.status === 'Tardy',
      sync_to_openemis: true
    };

    // If there's a reason, we might want to append it? 
    // The LMS API doesn't seem to have a 'reason' field in the docs provided, 
    // only 'is_late'. We will log it for now or if there's a comment field not documented.

    return this.http.post<any>(`${this.apiUrl}/attendance`, payload).pipe(
      map(response => {
        if (response.success) {
          return { success: true };
        } else {
          throw new Error(response.error || 'Attendance recording failed');
        }
      }),
      finalize(() => Swal.close()),
      catchError(this.handleError)
    );
  }

  getStudentDetails(openemis_no: string): Observable<any> {
    return this.getStudentDetailsByEmisNo(openemis_no);
  }

  updateStudentPhoto(openemis_no: string, photo_content: string): Observable<{ success: boolean }> {
    // Endpoint for photo upload is not yet defined/verified.
    // Returning success to not break the UI flow.
    console.warn('Photo upload endpoint not implemented yet.');
    return of({ success: true });
  }

  verifyStudent(qrCodeData: string, schoolName: string): Observable<Student> {
    console.log(`Verifying QR Code: ${qrCodeData} for school: ${schoolName}`);

    // The QR code is expected to contain the OpenEMIS Number
    return this.getStudentDetailsByEmisNo(qrCodeData).pipe(
      map(student => {
        if (!student) {
          throw new Error('Student not found');
        }
        return student;
      })
    );
  }

  // Helper to map API data to our App's interface
  private mapApiStudentToAppStudent(apiStudent: any): Student {
    return {
      openemis_no: apiStudent.openemis_no,
      first_name: apiStudent.first_name,
      middle_name: apiStudent.middle_name || '',
      third_name: apiStudent.third_name || '',
      last_name: apiStudent.last_name,
      gender_id: { key: apiStudent.gender_id, value: apiStudent.gender_name },
      date_of_birth: apiStudent.date_of_birth,
      institution: { key: apiStudent.institution_id, value: apiStudent.institution_name },
      photo_content: null, // Photo not available in this endpoint
      status: undefined, // Status is not tracked in this endpoint
      attendanceHistory: [] // History not available in this endpoint
    };
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Communication with server failed.',
    });
    return throwError(() => error);
  }
}

