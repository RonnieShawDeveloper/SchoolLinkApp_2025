# AttendanceAPI Testing Guide

## Overview
This guide provides comprehensive testing instructions for the AttendanceAPI plugin endpoint that allows recording student attendance via API calls.

## API Endpoint Information

### Base URL
```
POST /API/v1.0/Plugin/AttendanceAPI
```

### Authentication
- **Method**: HTTP Basic Authentication
- **Username**: API Key (e.g., `2a3da1306e72cf015dff`)
- **Password**: Empty string
- **Header**: `Authorization: Basic <base64_encoded_api_key:>`

### Content Type
```
Content-Type: application/x-www-form-urlencoded
```

## Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `date` | string | Attendance date in Y-m-d format | `2024-05-29` |
| `student_openemis_no` | string | Student's OpenEMIS number | `2741866626` |
| `period` | integer | Period number (1 or 2) | `1` |

## Optional Parameters

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `academic_period` | integer | Active period | Academic period ID | `1` |
| `is_late` | boolean | `false` | Mark student as late | `true` |
| `sync_to_openemis` | boolean | `true` | Sync to OpenEMIS platform | `false` |

## Test Cases

### 1. Basic Present Attendance (Happy Path)

**Test Case**: Record a student as present for period 1

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=1"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "attendance_id": 123,
  "student_id": 456,
  "student_name": "John Doe",
  "homeroom_id": 789,
  "homeroom_name": "Grade 5A",
  "course_id": 101,
  "course_name": "Homeroom Class",
  "date": "2024-05-29",
  "period": 1,
  "is_late": false,
  "status": "Present",
  "sync_to_openemis": true
}
```

### 2. Late Attendance

**Test Case**: Record a student as late for period 2

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=2&is_late=true"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "attendance_id": 124,
  "student_id": 456,
  "student_name": "John Doe",
  "homeroom_id": 789,
  "homeroom_name": "Grade 5A",
  "course_id": 101,
  "course_name": "Homeroom Class",
  "date": "2024-05-29",
  "period": 2,
  "is_late": true,
  "status": "Late",
  "sync_to_openemis": true
}
```

### 3. Without OpenEMIS Sync

**Test Case**: Record attendance without syncing to OpenEMIS

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=1&sync_to_openemis=false"
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "attendance_id": 125,
  "student_id": 456,
  "student_name": "John Doe",
  "homeroom_id": 789,
  "homeroom_name": "Grade 5A",
  "course_id": 101,
  "course_name": "Homeroom Class",
  "date": "2024-05-29",
  "period": 1,
  "is_late": false,
  "status": "Present",
  "sync_to_openemis": false
}
```

### 4. With Specific Academic Period

**Test Case**: Record attendance for a specific academic period

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=1&academic_period=2"
```

## Error Test Cases

### 5. Missing Required Parameters

**Test Case**: Missing `date` parameter

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "student_openemis_no=2741866626&period=1"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Missing required parameter: date"
}
```

### 6. Invalid Date Format

**Test Case**: Invalid date format

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=29-05-2024&student_openemis_no=2741866626&period=1"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Invalid date format. Expected Y-m-d format"
}
```

### 7. Invalid Period

**Test Case**: Invalid period value

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=3"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Period must be 1 or 2"
}
```

### 8. Student Not Found

**Test Case**: Non-existent student OpenEMIS number

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=9999999999&period=1"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Student with OpenEMIS number 9999999999 not found"
}
```

### 9. Student Without Homeroom

**Test Case**: Student not assigned to any homeroom

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=1234567890&period=1"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "No homeroom class found for student in academic period 1"
}
```

### 10. Duplicate Attendance

**Test Case**: Record attendance for the same student, date, and period twice

**Request** (First call - should succeed):
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=1"
```

**Request** (Second call - should fail):
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=1"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Attendance already recorded for student on 2024-05-29 for period 1"
}
```

### 11. Wrong HTTP Method

**Test Case**: Use GET instead of POST

**Request**:
```bash
curl -X GET "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6"
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Only POST method is supported for attendance recording"
}
```

### 12. Invalid Authentication

**Test Case**: Missing or invalid API key

**Request**:
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-29&student_openemis_no=2741866626&period=1"
```

**Expected Response**:
```json
{
  "error": {
    "code": 401,
    "message": "This action requires authentication. Please provide your API key as the HTTP Basic Authentication User with an empty Password."
  },
  "success": false
}
```

## Performance Testing

### 13. Concurrent Requests

**Test Case**: Send multiple concurrent requests to test system stability

**Script** (using Apache Bench):
```bash
ab -n 100 -c 10 -p attendance_data.txt -T "application/x-www-form-urlencoded" -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" http://localhost/API/v1.0/Plugin/AttendanceAPI
```

Where `attendance_data.txt` contains:
```
date=2024-05-29&student_openemis_no=2741866626&period=1
```

## Data Validation Testing

### 14. Edge Cases

**Test Case**: Future dates
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2030-12-31&student_openemis_no=2741866626&period=1"
```

**Test Case**: Past dates
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2020-01-01&student_openemis_no=2741866626&period=1"
```

**Test Case**: Weekend dates
```bash
curl -X POST "http://localhost/API/v1.0/Plugin/AttendanceAPI" \
  -H "Authorization: Basic MjEzZGEzMDY2ZTcyY2YwMTVkZmY6" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "date=2024-05-25&student_openemis_no=2741866626&period=1"
```

## Database Verification

After each successful test, verify the data was correctly stored:

### Check Attendance Table
```sql
SELECT * FROM 1on1_attendance 
WHERE students_ID = 456 
AND DATE(marked_on) = '2024-05-29' 
AND periods_ID = 1;
```

### Check Sync Status
```sql
SELECT sync_status, response 
FROM 1on1_attendance 
WHERE id = <attendance_id>;
```

## Test Data Setup

### Prerequisites
1. **Valid Student**: Ensure student with OpenEMIS number `2741866626` exists
2. **Active Academic Period**: Verify academic period 1 is active
3. **Homeroom Assignment**: Student must be assigned to a homeroom
4. **Course Association**: Homeroom must have an associated course
5. **API Key**: Valid API key with proper permissions

### Test Data Cleanup
After testing, clean up test data:
```sql
DELETE FROM 1on1_attendance 
WHERE DATE(marked_on) = '2024-05-29' 
AND comments LIKE '%API%';
```

## Expected Behavior Summary

### Success Scenarios
- ✅ Valid student with proper homeroom assignment
- ✅ Correct date format (Y-m-d)
- ✅ Valid period (1 or 2)
- ✅ All required parameters provided
- ✅ Proper authentication

### Failure Scenarios
- ❌ Missing required parameters
- ❌ Invalid date format
- ❌ Invalid period values
- ❌ Non-existent student
- ❌ Student without homeroom
- ❌ Duplicate attendance records
- ❌ Wrong HTTP method
- ❌ Invalid authentication
- ❌ Missing course for homeroom

## Monitoring and Logging

### Check Application Logs
Monitor the application logs for:
- API authentication attempts
- Database errors
- OpenEMIS sync failures
- Performance issues

### Check Database Logs
Monitor for:
- Failed attendance insertions
- Sync status updates
- Constraint violations

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check API key and authentication format
2. **Student Not Found**: Verify OpenEMIS number exists and student is active
3. **No Homeroom**: Ensure student is assigned to a homeroom for the academic period
4. **Duplicate Attendance**: Check if attendance already exists for the same date/period
5. **Sync Failures**: Check OpenEMIS connectivity and configuration

### Debug Steps
1. Verify API endpoint is accessible
2. Check authentication credentials
3. Validate student data in database
4. Confirm homeroom assignments
5. Test OpenEMIS connectivity
6. Review application logs for detailed error messages

## Test Execution Checklist

- [ ] Basic present attendance recording
- [ ] Late attendance recording
- [ ] Attendance without OpenEMIS sync
- [ ] Specific academic period handling
- [ ] Missing parameter validation
- [ ] Invalid date format handling
- [ ] Invalid period validation
- [ ] Non-existent student handling
- [ ] Student without homeroom handling
- [ ] Duplicate attendance prevention
- [ ] Wrong HTTP method handling
- [ ] Authentication validation
- [ ] Performance testing
- [ ] Database verification
- [ ] Test data cleanup

## Notes

- The API uses HTTP Basic Authentication with the API key as username
- All dates must be in Y-m-d format
- Period values are restricted to 1 or 2
- The system automatically determines the student's homeroom and course
- OpenEMIS sync is enabled by default but can be disabled
- Duplicate attendance records are prevented for the same student, date, and period
- The API returns detailed success/error information for troubleshooting
