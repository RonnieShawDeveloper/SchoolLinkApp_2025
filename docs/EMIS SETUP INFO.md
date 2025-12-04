## Information that has been given to us about EMIS Integration:

Please find below the details regarding the OpenEMIS API documentation and the information required for your initial configuration.
You will be provided with a username, password, and API key, which are to be used in the /api/v4/login endpoint to authenticate and retrieve a user access token. This token will then be required for interacting with the desired API endpoints.

For your initial setup, our understanding is that you will need access to the complete list of students and their current school enrollment. The following endpoints will be useful:

/api/v4/users – Retrieve a list of users, filtering by is_student.

/api/v4/users/{userId} – Retrieve user details, including their institution.

/api/v4/institutions/students – Retrieve students enrolled in a given school.

/api/v4/institutions/list – Retrieve the list of institutions.

Please let us know if you require any additional clarification or further assistance.

-----------------------------
Please see the updates below regarding the EMIS and LMS credentials to advance your testing as requested.
The EMIS credentials that were shared have been tested and verified. They are confirmed to be restricted solely to the One on One Test School. Additionally, please note that the URL to be used and shared for access is the EMIS UAT environment.


$config = [
    'base_url' => 'https://bs-moe-uat.openemis.org/core',
    'api_key' => 'DfRHLIGF4IWt2wiSZ0ZpedPqg8Uw8VTl',
    'username' => 'master321@ooo.bs',
    'password' => 'MT@2025'
];

As it relates to the LMS credentials required for marking attendance, please find the details below. These are used for posting attendance data through the LMS Attendance API:

URL: http://bahamas-dev.1on1staging.com/API/v1.0/Plugin/AttendanceAPI
Username: 2a3da1306e72cf015dff
Authentication Type: Basic Header
Attached are previously shared API testing guide and specific endpoints needs for the integration.