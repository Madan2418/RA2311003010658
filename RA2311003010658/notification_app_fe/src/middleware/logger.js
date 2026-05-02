const TOKEN = import.meta.env.VITE_TOKEN
const LOG_API = "/api/logs"

const VALID_STACKS = ["backend", "frontend"]
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"]
const VALID_PACKAGES = [
  "cache", "controller", "cron_job", "db", "domain", "handler",
  "repository", "route", "service", "api", "component", "hook",
  "page", "state", "style", "auth", "config", "middleware", "utils"
]

export async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.includes(stack)) return
  if (!VALID_LEVELS.includes(level)) return
  if (!VALID_PACKAGES.includes(pkg)) return

  try {
    await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    })
  } catch (err) {
    // silently fail
  }
}