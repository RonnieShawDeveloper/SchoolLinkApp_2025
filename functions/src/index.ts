/**
 * @file index.ts
 * @description Main entry point for the SchoolLink EMIS Cloud Function.
 * This function acts as a secure middleware/proxy between the SchoolLink client application
 * and the OpenEMIS and LMS Attendance APIs. It handles authentication, token management,
 * and request forwarding to ensure secure and efficient communication with external systems.
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

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";

// Initialize Firebase Admin SDK to allow access to Firebase services if needed in the future.
admin.initializeApp();

// ==========================================
//  SchoolLink EMIS Function
// ==========================================

/**
 * Express application instance for handling HTTP requests.
 */
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the SchoolLink web application.
app.use(cors({ origin: true }));

// ----------------------------------------------------------------------------
// Configuration & Constants
// ----------------------------------------------------------------------------

/**
 * Base URL for the OpenEMIS Core API (UAT Environment).
 */
const EMIS_BASE_URL = "https://bs-moe-uat.openemis.org/core";

/**
 * API Key for authenticating with the OpenEMIS API.
 * @security This key is kept server-side to prevent exposure to the client.
 */
const EMIS_API_KEY = "DfRHLIGF4IWt2wiSZ0ZpedPqg8Uw8VTl";

/**
 * Default username for OpenEMIS authentication if not provided in the request.
 */
const DEFAULT_EMIS_USER = "master321@ooo.bs";

/**
 * Default password for OpenEMIS authentication if not provided in the request.
 */
const DEFAULT_EMIS_PASS = "MT@2025";

/**
 * Base URL for the LMS (Learning Management System) Attendance API.
 */
const LMS_BASE_URL = "https://bahamas-dev.1on1staging.com/API/v1.0/Plugin/AttendanceAPI";

/**
 * API Key for authenticating with the LMS Attendance API.
 */
const LMS_API_KEY = "2a3da1306e72cf015dff";

// ----------------------------------------------------------------------------
// EMIS Endpoints
// ----------------------------------------------------------------------------

/**
 * @route POST /login
 * @description Authenticates a user against the OpenEMIS API.
 * It accepts a username and password, or uses defaults if not provided.
 * It appends the secure API Key server-side before forwarding the request.
 *
 * @param {string} [req.body.username] - The username for OpenEMIS (optional).
 * @param {string} [req.body.password] - The password for OpenEMIS (optional).
 *
 * @returns {object} 200 - JSON response containing the authentication token and user details from OpenEMIS.
 * @returns {object} 500 - JSON error object if login fails.
 */
app.post("/login", async (req: Request, res: Response) => {
    try {
        let { username, password } = req.body;

        // If the user submits the specific test credentials, use the default master account
        if (username === "test@test.com" && password === "Test10@") {
            username = DEFAULT_EMIS_USER;
            password = DEFAULT_EMIS_PASS;
        }

        const user = username || DEFAULT_EMIS_USER;
        const pass = password || DEFAULT_EMIS_PASS;

        // Forward login request to OpenEMIS with the API Key
        const response = await axios.post(`${EMIS_BASE_URL}/api/v4/login`, null, {
            params: {
                username: user,
                password: pass,
                api_key: EMIS_API_KEY,
            },
        });

        res.json(response.data);
    } catch (error: any) {
        console.error("Login Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Login failed" });
    }
});

/**
 * @route GET /emis/*
 * @description A generic proxy endpoint for all OpenEMIS GET requests.
 * It captures the path after `/emis/` and forwards the request to the OpenEMIS API.
 * It requires a valid Authorization token in the header, which is passed through to OpenEMIS.
 *
 * @param {string} req.params[0] - The path segment to forward to OpenEMIS (e.g., 'institutions', 'students').
 * @param {string} req.headers.authorization - The Bearer token obtained from the /login endpoint.
 *
 * @returns {object} 200 - JSON response data from the requested OpenEMIS endpoint.
 * @returns {object} 401 - Error if the Authorization header is missing.
 * @returns {object} 500 - Error if the upstream request fails.
 */
app.get("/emis/*", async (req: Request, res: Response) => {
    try {
        const path = (req.params as any)[0];
        const token = req.headers.authorization;

        if (!token) {
            res.status(401).json({ error: "Missing Authorization header" });
            return;
        }

        // Forward the GET request to OpenEMIS with the user's token
        const response = await axios.get(`${EMIS_BASE_URL}/api/v4/${path}`, {
            headers: { Authorization: token },
            params: req.query,
        });

        res.json(response.data);
    } catch (error: any) {
        console.error(`EMIS Proxy Error (${req.path}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "EMIS request failed" });
    }
});

// ----------------------------------------------------------------------------
// LMS Endpoints
// ----------------------------------------------------------------------------

/**
 * @route POST /attendance
 * @description Records student attendance in the LMS system.
 * It constructs the required Basic Authentication header using the server-side LMS API Key.
 *
 * @param {object} req.body - The attendance data payload.
 * @param {string} req.body.student_openemis_no - The student's OpenEMIS ID.
 * @param {string} req.body.date - The date of attendance (YYYY-MM-DD).
 * @param {number} req.body.period - The class period (e.g., 1).
 * @param {boolean} req.body.is_late - Whether the student was late.
 * @param {boolean} req.body.sync_to_openemis - Flag to sync data back to OpenEMIS.
 *
 * @returns {object} 200 - JSON response from the LMS API confirming the record was saved.
 * @returns {object} 500 - Error if the attendance recording fails.
 */
app.post("/attendance", async (req: Request, res: Response) => {
    try {
        // Construct Basic Auth header for LMS
        const authHeader = `Basic ${Buffer.from(`${LMS_API_KEY}:`).toString("base64")}`;

        // Convert JSON body to URL-encoded string for x-www-form-urlencoded
        const formData = new URLSearchParams(req.body as any).toString();

        console.log("Sending Attendance Data to LMS:", formData);

        const response = await axios.post(LMS_BASE_URL, formData, {
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 10000, // Fail fast after 10 seconds
        });

        console.log("LMS Response:", response.status, response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error("Attendance Error:", error.message);
        if (error.response) {
            console.error("LMS Error Response:", error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Attendance recording failed: " + error.message });
        }
    }
});

/**
 * Exports the Express app as a Firebase Cloud Function named 'SchoolLinkEMIS'.
 * This function handles all incoming HTTPS requests matching the defined routes.
 */
export const SchoolLinkEMIS = functions.https.onRequest(app);
