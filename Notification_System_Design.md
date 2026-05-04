# Stage 1

## Approach

Each notification has a type (Placement, Result, Event) and a timestamp. I assigned weights to each type since placements are more important than results, and results more important than events.

- Placement → 3
- Result → 2
- Event → 1

I sort all notifications by weight first. If two notifications have the same type, the newer one comes first. Then I just take the top 10 from the sorted list.

## Handling New Notifications Efficiently

Sorting the entire list every time a new notification comes in is wasteful. So I used a Min Heap of size 10. 

The idea is simple — the heap always keeps the 10 best notifications. When a new notification arrives, I check if it beats the weakest one currently in the heap. If yes, I replace it. This way I never sort the full list again.

This runs in O(log n) per new notification instead of O(n log n) for a full sort each time.