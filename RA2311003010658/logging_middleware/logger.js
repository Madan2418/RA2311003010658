const axios = require("axios");

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJtczA1ODVAc3JtaXN0LmVkdS5pbiIsImV4cCI6MTc3NzY5OTkxMSwiaWF0IjoxNzc3Njk5MDExLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMzA1NTZkNDYtYzZmYS00M2I2LWJmYWItMzkzOTIxZTk4MmNlIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibWFkYW5rdW1hciBzZW50aGlsa3VtYXIiLCJzdWIiOiIyNDhjZGQyYi1mN2NjLTQ1OWItOTY3ZC0zMTNhOGM3YmU0MGYifSwiZW1haWwiOiJtczA1ODVAc3JtaXN0LmVkdS5pbiIsIm5hbWUiOiJtYWRhbmt1bWFyIHNlbnRoaWxrdW1hciIsInJvbGxObyI6InJhMjMxMTAwMzAxMDY1OCIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6IjI0OGNkZDJiLWY3Y2MtNDU5Yi05NjdkLTMxM2E4YzdiZTQwZiIsImNsaWVudFNlY3JldCI6ImVhQWtqZlNKVUZxVG1uZ2YifQ.2PDuULQioHni8q2PnatwkJ8aYqrn0BOz4WC-eZ8B0GM";

const LOG_API = "http://20.207.122.201/evaluation-service/logs";

// valid values as per the task requirements
const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = [
    "cache", "controller", "cron_job", "db", "domain", "handler",
    "repository", "route", "service", "api", "component", "hook",
    "page", "state", "style", "auth", "config", "middleware", "utils"
];

async function Log(stack, level, pkg, message) {
    // basic validation
    if (!VALID_STACKS.includes(stack)) {
        console.error(`Invalid stack: ${stack}`);
        return;
    }
    if (!VALID_LEVELS.includes(level)) {
        console.error(`Invalid level: ${level}`);
        return;
    }
    if (!VALID_PACKAGES.includes(pkg)) {
        console.error(`Invalid package: ${pkg}`);
        return;
    }

    try {
        const response = await axios.post(
            LOG_API,
            {
                stack: stack,
                level: level,
                package: pkg,
                message: message,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${TOKEN}`,
                },
            }
        );
        console.log(`Log sent: ${response.data.logID}`);
    } catch (err) {
        console.error("Failed to send log:", err.message);
    }
}

module.exports = { Log };