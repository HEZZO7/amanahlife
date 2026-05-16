import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list('', 1000);
    
    const now = new Date();
    const processedCount = { success: 0, notified: 0, skipped: 0 };

    for (const user of allUsers) {
      // Get user settings
      const userSettingsList = await base44.asServiceRole.entities.Settings.filter({ created_by: user.email });
      if (!userSettingsList || userSettingsList.length === 0) {
        processedCount.skipped++;
        continue;
      }

      const settings = userSettingsList[0];

      // Skip if prayer notifications disabled
      if (!settings.notify_prayer || !settings.prayer_reminder_enabled) {
        processedCount.skipped++;
        continue;
      }

      // Get saved location
      if (!settings.prayer_location_latitude || !settings.prayer_location_longitude) {
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

      // Fetch prayer times for saved location
      const prayerTimes = await fetchPrayerTimes(
        settings.prayer_location_latitude,
        settings.prayer_location_longitude
      );

      if (!prayerTimes) {
        processedCount.skipped++;
        continue;
      }

      // Check for prayers starting now
      const startingNow = checkPrayersStartingNow(prayerTimes, now);

      if (startingNow.length > 0) {
        try {
          for (const prayer of startingNow) {
            await sendPrayerNotification(
              base44,
              user.email,
              user.full_name,
              prayer,
              settings.prayer_location_name,
              settings.language || 'ar'
            );
          }
          processedCount.notified++;
        } catch (emailError) {
          console.error(`Failed to send prayer notification to ${user.email}:`, emailError.message);
        }
      }

      processedCount.success++;
    }

    return Response.json({
      success: true,
      timestamp: now.toISOString(),
      processed: processedCount
    });

  } catch (error) {
    console.error('Prayer time notification error:', error);
    return Response.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});

async function fetchPrayerTimes(latitude, longitude) {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=4`
    );
    const data = await response.json();

    if (data.code === 200) {
      return {
        fajr: data.data.timings.Fajr,
        dhuhr: data.data.timings.Dhuhr,
        asr: data.data.timings.Asr,
        maghrib: data.data.timings.Maghrib,
        isha: data.data.timings.Isha,
      };
    }
    return null;
  } catch (err) {
    console.error('Error fetching prayer times:', err);
    return null;
  }
}

function checkPrayersStartingNow(prayerTimes, now) {
  const prayers = [
    { key: 'fajr', nameAr: 'الفجر', nameEn: 'Fajr', icon: '🌙' },
    { key: 'dhuhr', nameAr: 'الظهر', nameEn: 'Dhuhr', icon: '☀️' },
    { key: 'asr', nameAr: 'العصر', nameEn: 'Asr', icon: '🌤️' },
    { key: 'maghrib', nameAr: 'المغرب', nameEn: 'Maghrib', icon: '🌅' },
    { key: 'isha', nameAr: 'العشاء', nameEn: 'Isha', icon: '🌙' }
  ];

  const nowTime = now.getHours() * 60 + now.getMinutes();
  const upcomingPrayers = [];

  prayers.forEach(prayer => {
    const prayerTime = prayerTimes[prayer.key];
    if (prayerTime) {
      const [hour, minute] = prayerTime.split(':').map(Number);
      const prayerTotalMin = hour * 60 + minute;
      const timeDiff = nowTime - prayerTotalMin;

      // Prayer has started (within 1-2 minutes grace period)
      if (timeDiff >= -1 && timeDiff <= 2) {
        upcomingPrayers.push({
          key: prayer.key,
          name: prayer.nameEn,
          nameAr: prayer.nameAr,
          time: prayerTime,
          icon: prayer.icon
        });
      }
    }
  });

  return upcomingPrayers;
}

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

async function sendPrayerNotification(base44, email, fullName, prayer, locationName, language) {
  const isArabic = language === 'ar';

  const subject = isArabic
    ? `⏰ حان وقت صلاة ${prayer.nameAr}`
    : `⏰ Time for ${prayer.name} Prayer`;

  const htmlBody = isArabic
    ? `
      <div style="font-family: 'Arial', sans-serif; direction: rtl; color: #333; max-width: 500px;">
        <div style="background: linear-gradient(135deg, #0B5B50 0%, #12897A 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🕌 ${prayer.icon}</h1>
          <h2 style="margin: 10px 0 5px 0; font-size: 32px;">صلاة ${prayer.nameAr}</h2>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">الوقت قد حان</p>
        </div>

        <div style="background: #f8f6f1; padding: 25px; border-radius: 12px; margin-bottom: 20px; border-right: 5px solid #0B5B50;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <p style="margin: 0; color: #999; font-size: 12px;">الموقع</p>
              <p style="margin: 5px 0 0 0; color: #0B5B50; font-weight: bold; font-size: 14px;">${locationName}</p>
            </div>
            <div>
              <p style="margin: 0; color: #999; font-size: 12px;">الوقت</p>
              <p style="margin: 5px 0 0 0; color: #0B5B50; font-weight: bold; font-size: 14px;">${prayer.time}</p>
            </div>
          </div>
        </div>

        <div style="background: #fff8f0; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-right: 4px solid #B89A5E; text-align: center;">
          <p style="margin: 0; color: #0B5B50; font-size: 16px; font-weight: bold;">
            🤲 توجه للمسجد أو مكان الصلاة
          </p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
            "إن الله مع الذين اتقوا والذين هم محسنون"
          </p>
        </div>

        <div style="text-align: center; padding: 15px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #999; font-size: 11px;">
            هذا التنبيه مرسل من تطبيق أمانة الحياة
          </p>
        </div>
      </div>
    `
    : `
      <div style="font-family: 'Arial', sans-serif; color: #333; max-width: 500px;">
        <div style="background: linear-gradient(135deg, #0B5B50 0%, #12897A 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🕌 ${prayer.icon}</h1>
          <h2 style="margin: 10px 0 5px 0; font-size: 32px;">${prayer.name} Prayer</h2>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Time has come</p>
        </div>

        <div style="background: #f8f6f1; padding: 25px; border-radius: 12px; margin-bottom: 20px; border-left: 5px solid #0B5B50;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <p style="margin: 0; color: #999; font-size: 12px;">Location</p>
              <p style="margin: 5px 0 0 0; color: #0B5B50; font-weight: bold; font-size: 14px;">${locationName}</p>
            </div>
            <div>
              <p style="margin: 0; color: #999; font-size: 12px;">Time</p>
              <p style="margin: 5px 0 0 0; color: #0B5B50; font-weight: bold; font-size: 14px;">${prayer.time}</p>
            </div>
          </div>
        </div>

        <div style="background: #fff8f0; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #B89A5E; text-align: center;">
          <p style="margin: 0; color: #0B5B50; font-size: 16px; font-weight: bold;">
            🤲 Head to the mosque or place of prayer
          </p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
            "Indeed, Allah is with those who are righteous and those who are doers of good."
          </p>
        </div>

        <div style="text-align: center; padding: 15px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #999; font-size: 11px;">
            This notification is sent from AmanahLife app
          </p>
        </div>
      </div>
    `;

  await base44.asServiceRole.integrations.Core.SendEmail({
    to: email,
    subject: subject,
    body: htmlBody,
    from_name: 'أمانة الحياة'
  });
}