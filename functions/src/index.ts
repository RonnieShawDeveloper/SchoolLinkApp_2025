import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as express from "express";
import { Request, Response } from "express";
import * as cors from "cors";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Configuration
const EMIS_BASE_URL = "https://bs-moe-uat.openemis.org/core";
const EMIS_API_KEY = "DfRHLIGF4IWt2wiSZ0ZpedPqg8Uw8VTl";
// Default credentials for testing if not provided
const DEFAULT_EMIS_USER = "master321@ooo.bs";
const DEFAULT_EMIS_PASS = "MT@2025";

const LMS_BASE_URL = "http://bahamas-dev.1on1staging.com/API/v1.0/Plugin/AttendanceAPI";
const LMS_API_KEY = "2a3da1306e72cf015dff";

// --- EMIS Endpoints ---

// Login to EMIS
app.post("/login", async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = username || DEFAULT_EMIS_USER;
        const pass = password || DEFAULT_EMIS_PASS;

        // The EMIS login endpoint requires query parameters for credentials
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

// Generic proxy for EMIS GET requests (Schools, Students)
// Expects 'Authorization: Bearer <token>' in headers
app.get("/emis/*", async (req: Request, res: Response) => {
    try {
        const path = (req.params as any)[0]; // Captures the part after /emis/
        const token = req.headers.authorization;

        if (!token) {
            res.status(401).json({ error: "Missing Authorization header" });
            return;
        }

        // Forward query parameters
        const response = await axios.get(`${EMIS_BASE_URL}/api/v4/${path}`, {
            headers: {
                Authorization: token, // Forward the token (Bearer ...)
            },
            params: req.query,
        });

        res.json(response.data);
    } catch (error: any) {
        console.error(`EMIS Proxy Error (${req.path}):`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "EMIS request failed" });
    }
});

// --- LMS Endpoints ---

// Record Attendance
app.post("/attendance", async (req: Request, res: Response) => {
    try {
        // LMS requires Basic Auth with API Key as username, empty password
        const authHeader = `Basic ${Buffer.from(`${LMS_API_KEY}:`).toString("base64")}`;

        // Forward the body data (date, student_openemis_no, period, etc.)
        // Content-Type must be application/x-www-form-urlencoded
        const response = await axios.post(LMS_BASE_URL, req.body, {
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        res.json(response.data);
    } catch (error: any) {
        console.error("Attendance Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Attendance recording failed" });
    }
});

// Expose the Express app as a Cloud Function
export const api = functions.https.onRequest(app);
