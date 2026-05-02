require("dotenv").config();
const TOKEN = process.env.TOKEN;
const axios = require("axios");
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