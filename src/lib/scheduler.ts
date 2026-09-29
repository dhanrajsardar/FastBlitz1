export function nextAvailableTimeSlot(existingScheduledDates: Date[]): Date {
  const now = new Date();

  // Define allowed algorithmic posting windows (e.g., 10 AM, 2 PM, 6:30 PM, 9 PM)
  const windows = [
    { hours: 10, minutes: 0 },
    { hours: 14, minutes: 0 },
    { hours: 18, minutes: 30 },
    { hours: 21, minutes: 0 }
  ];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    // Create a new date instance for each day to avoid mutation bugs
    const candidateDay = new Date(now);
    candidateDay.setDate(now.getDate() + dayOffset);

    for (const win of windows) {
      const candidate = new Date(candidateDay);
      candidate.setHours(win.hours, win.minutes, 0, 0);

      if (candidate > now) {
        // Check if this slot is taken
        const isTaken = existingScheduledDates.some(d =>
          Math.abs(d.getTime() - candidate.getTime()) < 1000 * 60 * 30 // within 30 mins
        );

        if (!isTaken) return candidate;
      }
    }
  }

  return new Date(now.getTime() + 1000 * 60 * 60 * 24); // Fallback: 24 hours from now
}
