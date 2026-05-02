import { Log } from "../middleware/logger"

const TOKEN = import.meta.env.VITE_TOKEN

export async function fetchNotifications(page = 1, limit = 10, type = "") {
  let url = `/api/notifications?page=${page}&limit=${limit}`
  if (type) url += `&notification_type=${type}`

  try {
    await Log("frontend", "info", "api", `fetching notifications page=${page}`)
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    })
    const data = await res.json()
    await Log("frontend", "info", "api", "notifications fetched successfully")
    return data.notifications || []
  } catch (err) {
    await Log("frontend", "error", "api", `failed to fetch: ${err.message}`)
    return []
  }
}
