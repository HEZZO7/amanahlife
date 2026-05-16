import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings
    const userSettings = await base44.auth.getUser();
    const settings = userSettings.settings || {};

    // Check if prayer reminders are enabled
    if (!settings.prayer_reminder_enabled) {
      return Response.json({ message: 'Prayer reminders disabled' });
    }

    // Check if we're in silent hours
    if (settings.prayer_silent_enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const silentStart = settings.prayer_silent_start_time || '22:00';
      const silentEnd = settings.prayer_silent_end_time || '06:00';
      
      if (isInSilentHours(currentTime, silentStart, silentEnd)) {
        return Response.json({ message: 'In silent hours - no reminders' });
      }
    }

    // Get latest prayer times from user's location
    const prayerLogs = await base44.entities.PrayerLog.list('-date', 1);
    
    if (!prayerLogs || prayerLogs.length === 0) {
      return Response.json({ message: 'No prayer data available' });
    }

    const reminderMinutes = settings.prayer_reminder_minutes_before || 15;
    const now = new Date();
    
    // Get prayer times from user profile or stored data
    const userData = await base44.auth.me();
    const prayerTimes = userData.prayer_times;
    
    if (!prayerTimes) {
      return Response.json({ message: 'Prayer times not available' });
    }

    // Check each prayer time
    const upcomingPrayers = checkUpcomingPrayers(prayerTimes, now, reminderMinutes);
    
    if (upcomingPrayers.length > 0) {
      // Send notification for each upcoming prayer
      for (const prayer of upcomingPrayers) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `تذكير الصلة: ${prayer.nameAr} - ${prayer.time}`,
          body: `
            <h3>تذكير الصلة</h3>
            <p>الصلة: ${prayer.nameAr}</p>
            <p>الموقيت: ${prayer.time}</p>
            <p>سيبدأ الوقت خلال ${reminderMinutes} دقائق</p>
          `
        });
      }
    }

    return Response.json({ 
      success: true, 
      upcoming_prayers: upcomingPrayers,
      silent_hours_enabled: settings.prayer_silent_enabled
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function isInSilentHours(currentTime, silentStart, silentEnd) {
  const [currHour, currMin] = currentTime.split(':').map(Number);
  const [startHour, startMin] = silentStart.split(':').map(Number);
  const [endHour, endMin] = silentEnd.split(':').map(Number);
  
  const currTotalMin = currHour * 60 + currMin;
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  
  // Handle overnight case (e.g., 22:00 to 06:00)
  if (startTotalMin > endTotalMin) {
    return currTotalMin >= startTotalMin || currTotalMin < endTotalMin;
  }
  
  return currTotalMin >= startTotalMin && currTotalMin < endTotalMin;
}

function checkUpcomingPrayers(prayerTimes, now, minutesBefore) {
  const upcomingPrayers = [];
  const prayers = [
    { key: 'Fajr', nameAr: 'الفجر', nameEn: 'Fajr' },
    { key: 'Dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr' },
    { key: 'Asr', nameAr: 'العصر', nameEn: 'Asr' },
    { key: 'Maghrib', nameAr: 'المغرب', nameEn: 'Maghrib' },
    { key: 'Isha', nameAr: 'العشاء', nameEn: 'Isha' }
  ];

  const nowTime = now.getHours() * 60 + now.getMinutes();

  prayers.forEach(prayer => {
    const prayerTime = prayerTimes[prayer.key];
    if (prayerTime) {
      const [hour, minute] = prayerTime.split(':').map(Number);
      const prayerTotalMin = hour * 60 + minute;
      const timeDiff = prayerTotalMin - nowTime;

      if (timeDiff > 0 && timeDiff <= minutesBefore) {
        upcomingPrayers.push({
          name: prayer.nameEn,
          nameAr: prayer.nameAr,
          time: prayerTime,
          minutesUntil: timeDiff
        });
      }
    }
  });

  return upcomingPrayers;
}