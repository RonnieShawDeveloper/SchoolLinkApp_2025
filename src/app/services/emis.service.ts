import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Tardy';
  reason?: string;
}

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
  attendanceHistory: AttendanceRecord[];
}

@Injectable({
  providedIn: 'root'
})
export class EmisService {

  private schools: string[] = [
    'Amy Roberts Primary', 'B. A. Newton Primary', 'Bahamas Technical & Vocational Institute (BTVI) - Abaco',
    'Bahamas Technical & Vocational Institute (BTVI) - Andros', 'Bahamas Technical & Vocational Institute (BTVI) - Eleuthera',
    'Bahamas Technical & Vocational Institute (BTVI) - Exuma', 'Bahamas Technical & Vocational Institute (BTVI) - Grand Bahama',
    'Bahamas Technical & Vocational Institute (BTVI) - Nassau', 'Behring Point Primary', 'Black Point School',
    'Blake Academy', 'Bowen Sound Primary', 'Central Abaco Primary', 'Central Andros High', 'Cherokee Sound Primary',
    'Coopers Town Primary', 'East End Junior High', 'East End Preschool', 'East End Primary School', 'Eight Mile Rock High',
    'Exuma School for Exceptional', 'Farmers Cay School', 'Forest Primary', 'Fox Town Primary', 'Freeport Primary',
    'Freeport Primary School #2', 'George Town Primary', 'Grand Cay Comprehensive', 'Grand Bahama Academy',
    'Great Guana Cay Primary', 'Holmes Rock Primary', 'Hope Town Primary', 'Hugh Campbell Primary', 'J. A. Pinder Primary',
    "King's College School", 'Kingsway Academy', 'L.N. Coakley High', 'Lucaya International School',
    'Lyford Cay International School', 'Man-O-War Cay Primary', 'Mary Star of the Sea Catholic School',
    "Moore's Island All Age School", 'Moss Town Primary', 'Mount Thompson Primary', 'North Andros Instructional Service Centre',
    "Queen's College", 'Ragged Island School', 'Rokers Point Primary', 'Rolleville Primary', 'Sherlin C.',
    "St. Andrew's International School", 'Summit Academy', 'Tambearly International School', 'The Island School Eleuthera',
    'Treasure Cay Primary', 'Windsor School',
  ].sort();

  private mockStudents: MockStudent[] = [
    {
      openemis_no: '1522271973', first_name: 'Trushy', middle_name: '', third_name: 'Bait', last_name: 'Emilley',
      gender_id: { key: 2, value: 'Female' }, date_of_birth: '2011-01-01T00:00:00.000000Z',
      institution: { key: 2, value: 'Windhaven Primary School' }, photo_content: null,
      status: 'Present',
      attendanceHistory: [
        { date: '2025-11-10', status: 'Present' },
        { date: '2025-11-11', status: 'Present' },
        { date: '2025-11-12', status: 'Present' },
      ]
    },
    {
      openemis_no: '1522271974', first_name: 'John', middle_name: '', third_name: '', last_name: 'Doe',
      gender_id: { key: 1, value: 'Male' }, date_of_birth: '2010-05-15T00:00:00.000000Z',
      institution: { key: 1, value: 'Amy Roberts Primary' }, photo_content: null,
      status: 'Absent',
      attendanceHistory: [
        { date: '2025-11-10', status: 'Present' },
        { date: '2025-11-11', status: 'Tardy', reason: 'Late Bus' },
        { date: '2025-11-12', status: 'Absent' },
      ]
    },
    {
      openemis_no: '1522271975', first_name: 'Jane', middle_name: 'A', third_name: '', last_name: 'Smith',
      gender_id: { key: 2, value: 'Female' }, date_of_birth: '2012-08-22T00:00:00.000000Z',
      institution: { key: 3, value: 'Central Abaco Primary' }, photo_content: null,
      status: 'Tardy', tardyReason: 'Doctor\'s Appointment',
      attendanceHistory: [
        { date: '2025-11-10', status: 'Present' },
        { date: '2025-11-11', status: 'Present' },
        { date: '2025-11-12', status: 'Tardy', reason: 'Doctor\'s Appointment' },
      ]
    },
    {
      openemis_no: '1522271976', first_name: 'Peter', middle_name: '', third_name: '', last_name: 'Jones',
      gender_id: { key: 1, value: 'Male' }, date_of_birth: '2011-03-20T00:00:00.000000Z',
      institution: { key: 2, value: 'Windhaven Primary School' }, photo_content: null,
      status: 'Present',
      attendanceHistory: [
        { date: '2025-11-10', status: 'Present' },
        { date: '2025-11-11', status: 'Present' },
        { date: '2025-11-12', status: 'Present' },
      ]
    },
    {
      openemis_no: '1522271977', first_name: 'Alice', middle_name: 'B', third_name: '', last_name: 'Williams',
      gender_id: { key: 2, value: 'Female' }, date_of_birth: '2010-11-05T00:00:00.000000Z',
      institution: { key: 1, value: 'Amy Roberts Primary' }, photo_content: null,
      status: 'Present',
      attendanceHistory: [
        { date: '2025-11-10', status: 'Present' },
        { date: '2025-11-11', status: 'Present' },
        { date: '2025-11-12', status: 'Present' },
      ]
    },
    {
      openemis_no: '1522271978', first_name: 'Robert', middle_name: '', third_name: '', last_name: 'Brown',
      gender_id: { key: 1, value: 'Male' }, date_of_birth: '2012-01-25T00:00:00.000000Z',
      institution: { key: 3, value: 'Central Abaco Primary' }, photo_content: null,
      status: 'Absent',
      attendanceHistory: [
        { date: '2025-11-10', status: 'Present' },
        { date: '2025-11-11', status: 'Absent' },
        { date: '2025-11-12', status: 'Absent' },
      ]
    },
    {
      openemis_no: '1522271979', first_name: 'Emily', middle_name: '', third_name: '', last_name: 'Davis',
      gender_id: { key: 2, value: 'Female' }, date_of_birth: '2011-07-12T00:00:00.000000Z',
      institution: { key: 2, value: 'Windhaven Primary School' }, photo_content: null,
      status: 'Tardy', tardyReason: 'Traffic',
      attendanceHistory: [
        { date: '2025-11-10', status: 'Present' },
        { date: '2025-11-11', status: 'Tardy', reason: 'Traffic' },
        { date: '2025-11-12', status: 'Tardy', reason: 'Traffic' },
      ]
    },
  ];

  constructor() { }

  login(username: string, password: string): Observable<{ token: string }> {
    return of({ token: this.generateFakeToken(username) }).pipe(delay(1500));
  }

  getSchools(): Observable<string[]> {
    return of(this.schools).pipe(delay(2000));
  }

  getStudents(searchCriteria?: { lastName?: string, firstName?: string, dob?: string }): Observable<any[]> {
    Swal.fire({ title: 'Searching Students...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    let filteredStudents = this.mockStudents;

    if (searchCriteria) {
      filteredStudents = this.mockStudents.filter(student => {
        const lastNameMatch = !searchCriteria.lastName || (student.last_name && student.last_name.toLowerCase().includes(searchCriteria.lastName.toLowerCase()));
        const firstNameMatch = !searchCriteria.firstName || (student.first_name && student.first_name.toLowerCase().includes(searchCriteria.firstName.toLowerCase()));
        const dobMatch = !searchCriteria.dob || (student.date_of_birth && new Date(student.date_of_birth).toDateString() === new Date(searchCriteria.dob).toDateString());
        return lastNameMatch && firstNameMatch && dobMatch;
      });
    }

    return of(filteredStudents).pipe(
      delay(1500),
      finalize(() => Swal.close())
    );
  }

  getStudentsList(): Observable<MockStudent[]> {
    Swal.fire({ title: 'Fetching All Students...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    return of(this.mockStudents).pipe(
      delay(1500),
      finalize(() => Swal.close())
    );
  }

  getStudentDetailsByEmisNo(openemis_no: string): Observable<MockStudent | undefined> {
    Swal.fire({ title: 'Getting Student Details...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const student = this.mockStudents.find(s => s.openemis_no === openemis_no);
    return of(student).pipe(
      delay(1000),
      finalize(() => Swal.close())
    );
  }

  recordAttendance(attendanceData: { student_openemis_no: string, date: string, status: 'Present' | 'Absent' | 'Tardy', reason?: string }): Observable<{ success: boolean }> {
    Swal.fire({ title: 'Recording Attendance...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const student = this.mockStudents.find(s => s.openemis_no === attendanceData.student_openemis_no);
    if (student) {
      const newRecord: AttendanceRecord = {
        date: attendanceData.date,
        status: attendanceData.status,
      };
      if (attendanceData.reason) {
        newRecord.reason = attendanceData.reason;
      }
      student.attendanceHistory.push(newRecord);
      student.status = attendanceData.status;
      student.tardyReason = attendanceData.status === 'Tardy' ? attendanceData.reason : undefined;
      console.log(`Attendance recorded for ${student.first_name} ${student.last_name}:`, newRecord);
    }
    return of({ success: true }).pipe(
      delay(1500),
      finalize(() => Swal.close())
    );
  }

  getStudentDetails(openemis_no: string): Observable<any> {
    return this.getStudentDetailsByEmisNo(openemis_no);
  }

  updateStudentPhoto(openemis_no: string, photo_content: string): Observable<{ success: boolean }> {
    Swal.fire({ title: 'Saving Photo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const student = this.mockStudents.find(s => s.openemis_no === openemis_no);
    if (student) {
      student.photo_content = photo_content;
    }
    return of({ success: true }).pipe(
      delay(2000),
      finalize(() => Swal.close())
    );
  }

  verifyStudent(qrCodeData: string, schoolName: string): Observable<MockStudent> {
    console.log(`Verifying QR Code: ${qrCodeData} for school: ${schoolName}`);
    const foundStudent = this.mockStudents.find(student => student.openemis_no === qrCodeData);

    if (foundStudent) {
      // Simulate fetching the photo content if it's null
      if (!foundStudent.photo_content) {
        // Placeholder for base64 content of public/images/student-test-photo.jpg
        const studentTestPhotoBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAHgBLADASIAEBAAH/xAAfAAABBQEBAQEBAQEAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQIEAwQFBQQEAAABfQECAAMRBAUhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkBQoWFxgZGiQqJScpKTQyNjc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eXm5+jp6uvs7e7v8fHz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYVEiJTYXHR<ctrl63>'; // Full base64 string
        foundStudent.photo_content = studentTestPhotoBase64;
      }
      return of(foundStudent).pipe(delay(2500));
    } else {
      return throwError(() => new Error('Student not found'));
    }
  }

  private generateFakeToken(username: string): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: '1234567890', name: username, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + (60 * 60) };
    const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const signature = 'fake-signature';
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}

