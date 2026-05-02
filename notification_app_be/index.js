require("dotenv").config();
const axios = require("axios");
const { Log } = require("../logging_middleware/logger");

const TOKEN = process.env.TOKEN;
const NOTIF_API = "http://20.207.122.201/evaluation-service/notifications";

const TYPE_WEIGHT = {
    Placement: 3,
    Result: 2,
    Event: 1,
};

async function fetchNotifications() {
    try {
        const res = await axios.get(NOTIF_API, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        });
        await Log("backend", "info", "handler", "notifications fetched successfully");
        return res.data.notifications;
    } catch (err) {
        await Log("backend", "error", "handler", `failed to fetch notifications: ${err.message}`);
        return [];
    }
}

function getScore(notification) {
    const weight = TYPE_WEIGHT[notification.Type] || 0;
    const timestamp = new Date(notification.Timestamp).getTime();
    return weight * 1e13 + timestamp;
}

class MinHeap {
    constructor(n) {
        this.n = n;
        this.heap = [];
    }

    score(i) {
        return getScore(this.heap[i]);
    }

    push(notification) {
        if (this.heap.length < this.n) {
            this.heap.push(notification);
            this._bubbleUp(this.heap.length - 1);
        } else if (getScore(notification) > this.score(0)) {
            this.heap[0] = notification;
            this._sinkDown(0);
        }
    }

    _bubbleUp(i) {
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this.score(parent) > this.score(i)) {
                [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
                i = parent;
            } else break;
        }
    }

    _sinkDown(i) {
        const n = this.heap.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1;
            const r = 2 * i + 2;
            if (l < n && this.score(l) < this.score(smallest)) smallest = l;
            if (r < n && this.score(r) < this.score(smallest)) smallest = r;
            if (smallest !== i) {
                [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
                i = smallest;
            } else break;
        }
    }

    getTop() {
        return [...this.heap].sort((a, b) => getScore(b) - getScore(a));
    }
}

function getTopN(notifications, n) {
    const heap = new MinHeap(n);
    for (const notif of notifications) {
        heap.push(notif);
    }
    return heap.getTop();
}

async function main() {
    await Log("backend", "info", "handler", "starting priority inbox");

    const notifications = await fetchNotifications();

    if (notifications.length === 0) {
        await Log("backend", "warn", "handler", "no notifications found");
        return;
    }

    await Log("backend", "info", "handler", `total notifications: ${notifications.length}`);

    const top10 = getTopN(notifications, 10);

    await Log("backend", "info", "handler", "top 10 priority notifications calculated");

    top10.forEach((notif, index) => {
        process.stdout.write(
            `${index + 1}. [${notif.Type}] ${notif.Message} | ${notif.Timestamp}\n`
        );
    });
}

main();