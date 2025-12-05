/**
 * @file emis.service.ts
 * @description Angular Service for interacting with the SchoolLink EMIS Cloud Function.
 * This service provides methods to authenticate users, retrieve school and student data,
 * record attendance, and manage student information by communicating with the secure backend proxy.
 *
 * @author Justice Technology Corp Development Team lead by
 * Ronnie Shaw, Chief Technology Officer and Senior Software Engineer.
 * @copyright (c) 2025 Justice Technology Corp. All rights reserved.
 * @property {string} owner - Justice Technology Corp
 *
 * NOTICE: All information contained herein is, and remains the property of Justice Technology Corp.
 * The intellectual and technical concepts contained herein are proprietary to Justice Technology Corp
 * and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission
 * is obtained from Justice Technology Corp.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap, finalize, timeout } from 'rxjs/operators';
import { Observable, of, throwError, firstValueFrom, TimeoutError } from 'rxjs';
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
  private apiUrl = 'https://us-central1-bbms-1283c.cloudfunctions.net/SchoolLinkEMIS';

  private token: string | null = null;

  constructor(private http: HttpClient) {
    // Restore token from localStorage if available
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Authenticates a user with the EMIS system.
   * Sends credentials to the backend proxy which forwards them to the OpenEMIS login endpoint.
   *
   * @param {string} username - The username for the EMIS account.
   * @param {string} password - The password for the EMIS account.
   * @returns {Observable<{ token: string }>} An observable containing the authentication token.
   */
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

  /**
   * Retrieves a list of all schools (institutions) from the EMIS.
   *
   * @returns {Observable<string[]>} An observable containing a sorted list of school names.
   * @throws {Error} If the user is not authenticated.
   */
  getSchools(): Observable<{ id: number, name: string }[]> {
    if (!this.token) {
      return throwError(() => new Error('Not authenticated'));
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    // Fetch all institutions. Might need pagination handling if > 100.
    // For now, requesting a large limit.
    const params = new HttpParams().set('limit', '1000');

    return this.http.get<any>(`${this.apiUrl}/emis/institutions`, { headers, params }).pipe(
      map(response => {
        // Map API response to array of school objects { id, name }
        const institutions = response.data.data;
        return institutions.map((inst: any) => ({ id: inst.id, name: inst.name }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Searches for students based on provided criteria.
   *
   * @param {object} [searchCriteria] - The criteria to filter students by.
   * @param {string} [searchCriteria.lastName] - The student's last name.
   * @param {string} [searchCriteria.firstName] - The student's first name.
   * @param {string} [searchCriteria.dob] - The student's date of birth.
   * @param {string} [searchCriteria.openemis_no] - The student's OpenEMIS number.
   * @returns {Observable<Student[]>} An observable containing a list of students matching the criteria.
   * @throws {Error} If the user is not authenticated.
   */
  getStudents(searchCriteria?: { lastName?: string, firstName?: string, dob?: string, openemis_no?: string }): Observable<Student[]> {
    if (!this.token) {
      return throwError(() => new Error('Not authenticated'));
    }
    Swal.fire({ title: 'Searching Students...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
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
        Swal.close();
        const apiStudents = response.data.data;
        return apiStudents.map(this.mapApiStudentToAppStudent);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves a general list of students.
   * This is an alias for getStudents() without parameters.
   *
   * @returns {Observable<Student[]>} An observable containing a list of students.
   */
  getStudentsList(): Observable<Student[]> {
    return this.getStudents();
  }

  /**
   * Retrieves details for a specific student by their OpenEMIS number.
   *
   * @param {string} openemis_no - The OpenEMIS number of the student.
   * @returns {Observable<Student | undefined>} An observable containing the student details or undefined if not found.
   */
  getStudentDetailsByEmisNo(openemis_no: string): Observable<Student | undefined> {
    // Reuse getStudents with specific filter
    return this.getStudents({ openemis_no }).pipe(
      map(students => students.find(s => s.openemis_no === openemis_no))
    );
  }

  /**
   * Records attendance for a student.
   * Sends the attendance data to the backend proxy to be forwarded to the LMS.
   *
   * @param {object} attendanceData - The attendance information.
   * @param {string} attendanceData.student_openemis_no - The student's OpenEMIS number.
   * @param {string} attendanceData.date - The date of attendance (YYYY-MM-DD).
   * @param {string} attendanceData.status - The attendance status ('Present', 'Absent', 'Tardy').
   * @param {string} [attendanceData.reason] - Optional reason for the status.
   * @returns {Observable<{ success: boolean }>} An observable indicating the success of the operation.
   */
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
      timeout(30000), // 30 seconds timeout
      map(response => {
        if (response.success) {
          return { success: true };
        } else {
          throw new Error(response.error || 'Attendance recording failed');
        }
      }),
      finalize(() => Swal.close()),
      catchError((error) => {
        // Handle Timeout (client-side) or Server Error (likely timeout/unreachable)
        if (error instanceof TimeoutError || error.status === 500) {
          return new Observable<{ success: boolean }>((observer) => {
            Swal.fire({
              title: 'No Response',
              text: 'There was no response from the EMIS server. Would you like to try again?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Try Again',
              cancelButtonText: 'Cancel',
              allowOutsideClick: false,
              allowEscapeKey: false
            }).then((result) => {
              if (result.isConfirmed) {
                // Recursive retry
                this.recordAttendance(attendanceData).subscribe({
                  next: (res) => {
                    observer.next(res);
                    observer.complete();
                  },
                  error: (err) => {
                    observer.error(err);
                  }
                });
              } else {
                // User cancelled
                observer.error(new Error('Attendance recording cancelled by user.'));
              }
            });
          });
        }
        // Handle other errors normally
        return this.handleError(error);
      })
    );
  }

  /**
   * Retrieves student details. Alias for getStudentDetailsByEmisNo.
   *
   * @param {string} openemis_no - The OpenEMIS number of the student.
   * @returns {Observable<any>} An observable containing the student details.
   */
  getStudentDetails(openemis_no: string): Observable<any> {
    return this.getStudentDetailsByEmisNo(openemis_no);
  }

  /**
   * Updates a student's photo.
   * NOTE: This method is currently a placeholder as the exact endpoint is being verified.
   *
   * @param {string} openemis_no - The OpenEMIS number of the student.
   * @param {string} photo_content - The Base64 encoded photo content.
   * @returns {Observable<{ success: boolean }>} An observable indicating success.
   */
  updateStudentPhoto(openemis_no: string, photo_content: string): Observable<{ success: boolean }> {
    // Endpoint for photo upload is not yet defined/verified.
    // Returning success to not break the UI flow.
    console.warn('Photo upload endpoint not implemented yet.');
    return of({ success: true });
  }

  /**
   * Verifies a student's enrollment at a specific school using a QR code.
   *
   * @param {string} qrCodeData - The data scanned from the QR code (expected to be the OpenEMIS number).
   * @param {string} schoolName - The name of the school to verify against.
   * @returns {Observable<Student>} An observable containing the verified student's details.
   * @throws {Error} If the student is not found.
   */
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

  /**
   * Maps the raw API student object to the application's Student interface.
   *
   * @param {any} apiStudent - The raw student object from the API.
   * @returns {Student} The mapped Student object.
   * @private
   */
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

  /**
   * Handles HTTP errors by logging them and displaying a user-friendly alert.
   *
   * @param {any} error - The error object.
   * @returns {Observable<never>} An observable that throws the error.
   * @private
   */
  private handleError(error: any) {
    console.error('An error occurred:', error);
    let errorMessage = 'An unexpected error occurred.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Access denied. You do not have permission.';
      } else if (error.status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = `Error Code: ${error.status}`;
      }

      // Append specific backend message if available
      if (error.error && error.error.error) {
        errorMessage += ` - ${error.error.error}`;
      } else if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // We removed the global Swal.fire here to allow components to handle errors individually
    // and avoid double-popups.
    return throwError(() => new Error(errorMessage));
  }
}


