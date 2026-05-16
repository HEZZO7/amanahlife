import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users with prayer reminders enabled
    const allUsers = await base44.asServiceRole.entities.User.list('', 1000);
    
    const now = new Date();
    const processedCount = { success: 0, skipped: 0 };

    for (const user of allUsers) {
      const settings = user.settings || {};

      // Skip if prayer reminders disabled
      if (!settings.prayer_reminder_enabled) {
        processedCount.skipped++;
        continue;
      }

      // Check silent hours
      if (settings.prayer_silent_enabled) {
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const silentStart = settings.prayer_silent_start_time || '22:00';
        const silentEnd = settings.prayer_silent_end_time || '06:00';
        
        if (isInSilentHours(currentTime, silentStart, silentEnd)) {
          processedCount.skipped++;
          continue;
        }
      }

      // Get user's prayer times (this would come from their location/settings)
      // For now, we'll use a placeholder - in production this would fetch from Aladhan API based on user location
      const prayerTimesData = user.prayer_times || null;

      if (!prayerTimesData) {
        processedCount.skipped++;
        continue;
      }

      const reminderMinutes = settings.prayer_reminder_minutes_before || 15;
      const upcomingPrayers = checkUpcomingPrayers(prayerTimesData, now, reminderMinutes);

      if (upcomingPrayers.length > 0) {
        try {
          // Send email notification for each upcoming prayer
          for (const prayer of upcomingPrayers) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: user.email,
              subject: `🕌 ${prayer.nameAr} في ${prayer.time}`,
              body: generatePrayerReminderEmail(prayer, reminderMinutes, user.full_name, user.settings?.language || 'ar')
            });
          }
          processedCount.success++;
        } catch (emailError) {
          console.error(`Failed to send reminder to ${user.email}:`, emailError.message);
          processedCount.skipped++;
        }
      } else {
        processedCount.skipped++;
      }
    }

    return Response.json({
      success: true,
      timestamp: now.toISOString(),
      processed: processedCount
    });

  } catch (error) {
    console.error('Prayer reminder scheduling error:', error);
    return Response.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});

function isInSilentHours(currentTime, silentStart, silentEnd) {
  const [currHour, currMin] = currentTime.split(':').map(Number);
  const [startHour, startMin] = silentStart.split(':').map(Number);
  const [endHour, endMin] = silentEnd.split(':').map(Number);
  
  const currTotalMin = currHour * 60 + currMin;
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;
  
  if (startTotalMin > endTotalMin) {
    return currTotalMin >= startTotalMin || currTotalMin < endTotalMin;
  }
  
  return currTotalMin >= startTotalMin && currTotalMin < endTotalMin;
}

function checkUpcomingPrayers(prayerTimes, now, minutesBefore) {
  const upcomingPrayers = [];
  const prayers = [
    { key: 'Fajr', nameAr: 'الفجر', nameEn: 'Fajr', icon: '🌙' },
    { key: 'Dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr', icon: '☀️' },
    { key: 'Asr', nameAr: 'العصر', nameEn: 'Asr', icon: '🌤️' },
    { key: 'Maghrib', nameAr: 'المغرب', nameEn: 'Maghrib', icon: '🌅' },
    { key: 'Isha', nameAr: 'العشاء', nameEn: 'Isha', icon: '🌙' }
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
          key: prayer.key,
          name: prayer.nameEn,
          nameAr: prayer.nameAr,
          time: prayerTime,
          minutesUntil: timeDiff,
          icon: prayer.icon
        });
      }
    }
  });

  return upcomingPrayers;
}

function generatePrayerReminderEmail(prayer, minutes, userName, language) {
  const isArabic = language === 'ar';
  
  const subject = isArabic 
    ? `تذكير: صلاة ${prayer.nameAr} في ${prayer.time}`
    : `Reminder: ${prayer.name} prayer at ${prayer.time}`;

  const body = isArabic
    ? `
      <div style="font-family: Arial, sans-serif; direction: rtl; color: #333;">
        <div style="background: linear-gradient(135deg, #0B5B50 0%, #12897A 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0;">🕌 تذكير الصلاة</h2>
          <p style="margin: 0; font-size: 14px;">حان وقت الاستعداد للصلاة</p>
        </div>
        
        <div style="background: #f8f6f1; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">الصلاة</p>
          <h1 style="margin: 0 0 10px 0; color: #0B5B50; font-size: 32px;">${prayer.nameAr}</h1>
          <p style="margin: 0; color: #999; font-size: 18px;">⏰ ${prayer.time}</p>
        </div>
        
        <div style="background: #fff8f0; padding: 15px; border-right: 4px solid #B89A5E; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            سيبدأ وقت الصلاة خلال <strong>${prayer.minutesUntil}</strong> دقائق. استعد الآن وتجهز للصلاة في وقتها.
          </p>
        </div>
        
        <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
          هذا التنبيه مرسل من تطبيق أمانة الحياة
        </p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="background: linear-gradient(135deg, #0B5B50 0%, #12897A 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0;">🕌 Prayer Reminder</h2>
          <p style="margin: 0; font-size: 14px;">It's time to prepare for prayer</p>
        </div>
        
        <div style="background: #f8f6f1; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Prayer</p>
          <h1 style="margin: 0 0 10px 0; color: #0B5B50; font-size: 32px;">${prayer.name}</h1>
          <p style="margin: 0; color: #999; font-size: 18px;">⏰ ${prayer.time}</p>
        </div>
        
        <div style="background: #fff8f0; padding: 15px; border-left: 4px solid #B89A5E; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            Prayer time starts in <strong>${prayer.minutesUntil}</strong> minutes. Prepare yourself now.
          </p>
        </div>
        
        <p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
          This reminder is sent from AmanahLife app
        </p>
      </div>
    `;

  return body;
}