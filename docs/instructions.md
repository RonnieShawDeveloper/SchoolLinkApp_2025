## Instructions
### Overview

This project is called SchoolLink. It is used to allow the administration of the school to scan a barcode on the students ID, verify that the student belongs to that school and then check in the student to their Period 1 homeroom class. If the student does not belong to the school, the employee can choose a reason for the student being at the school, such as registration, transfer, etc. 

The application will also allow the employees to update or create their student photo. 

### Application Structure

When the Employee logs in to the app, they will be taken to a dashboard where they can select the function they with to perform:

1) Attendance - The employee selects this function. First, the attendance component will ask them to select the school that they will be checking students at. Then, it will enter scanner mode where they can scan the student's ID. If the student is found, the attendance component will display the student's name, photo, and period. If the student is not found, the attendance component will display a message that the student is not found. 
2) Photos - If this function is selected, the employee will be taken to the photo component where they can access the students record by searching the database for the student, taking the students photo and uploading it to the database.

This app integrates with the school's EMIS system. The EMIS that is being used is OpenEMIS v4 and is hosted on a server maintained by the school board. The file called "docs/openemis-api-stripped.json" will explain the endpoints that are being used for this project. Not all endpoints are being used, however, this is a file dump from the current EMIS showing the structure of the endpoints. 

## Technologies Used

This is a Mobile First application that uses Angular 20 and Tailwind CSS v4. The app must be setup as a PWA so that it can be installed onto a device ( Android, iOS). This can be a phone or a tablet.  
