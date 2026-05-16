import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Droplet, Activity, Heart, Zap, X } from 'lucide-react';

const REMINDERS = {
  hydration: {
    ar: ['اشرب كوب ماء الآن ✨', 'جسدك يحتاج للماء - اشرب معك!', 'رطّب جسدك الآن 💧'],
    en: ['Time for water! 💧', 'Stay hydrated! Drink some water.', 'Hydration boost time! 💧'],
  },
  activity: {
    ar: ['وقت الحركة! 🏃', 'انهض وتحرك قليلاً', 'جرب تمرين سريع!'],
    en: ['Time to move! 🏃', 'Get up and stretch!', 'Quick activity boost! 🏃'],
  },
  sleep: {
    ar: ['تذكر: النوم مهم لصحتك 😴', 'حان وقت الراحة!', 'استعد للنوم المبكر ✨'],
    en: ['Sleep is health! 😴', 'Time to rest well!', 'Sleep matters! ✨'],
  },
  stress: {
    ar: ['خذ نفساً عميقاً 🧘', 'استرخ قليلاً', 'لحظة هدوء الآن'],
    en: ['Take a deep breath! 🧘', 'Relax for a moment.', 'Stress relief moment! 🧘'],
  },
};

export default function SmartReminders() {
  const { language } = useI18n();
  const [reminders, setReminders] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    // Generate daily reminders based on time and wellness tracking
    const hour = new Date().getHours();
    const newReminders = [];

    // Morning: hydration + activity
    if (hour >= 6 && hour < 12) {
      newReminders.push({
        id: 'hydration-morning',
        type: 'hydration',
        icon: Droplet,
        color: 'var(--mizan-emerald-light)',
      });
      newReminders.push({
        id: 'activity-morning',
        type: 'activity',
        icon: Activity,
        color: 'var(--mizan-green)',
      });
    }

    // Afternoon: hydration + stress
    if (hour >= 12 && hour < 18) {
      newReminders.push({
        id: 'hydration-afternoon',
        type: 'hydration',
        icon: Droplet,
        color: 'var(--mizan-emerald-light)',
      });
      newReminders.push({
        id: 'stress-afternoon',
        type: 'stress',
        icon: Heart,
        color: 'var(--mizan-red)',
      });
    }

    // Evening: activity + sleep
    if (hour >= 18 && hour < 22) {
      newReminders.push({
        id: 'activity-evening',
        type: 'activity',
        icon: Activity,
        color: 'var(--mizan-green)',
      });
    }

    // Night: sleep prep
    if (hour >= 20 || hour < 6) {
      newReminders.push({
        id: 'sleep-night',
        type: 'sleep',
        icon: Zap,
        color: 'var(--mizan-gold)',
      });
    }

    setReminders(newReminders);
  }, []);

  const dismissReminder = (id) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const trackHabit = async (type) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logs = await base44.entities.WellnessLog.filter({ date: today });

      if (logs.length > 0) {
        // Update existing log
        const log = logs[0];
        let updateData = {};

        if (type === 'hydration') {
          updateData.hydration_level = Math.min((log.hydration_level || 0) + 1, 10);
        } else if (type === 'activity') {
          updateData.notes = (log.notes || '') + ' [نشاط مسجل]';
        }

        if (Object.keys(updateData).length > 0) {
          await base44.entities.WellnessLog.update(log.id, updateData);
        }
      } else {
        // Create new log
        const newLog = { date: today, mood: 'neutral' };
        if (type === 'hydration') newLog.hydration_level = 1;
        await base44.entities.WellnessLog.create(newLog);
      }

      dismissReminder('all');
    } catch (err) {
      console.error('Error tracking habit:', err);
    }
  };

  const visibleReminders = reminders.filter(r => !dismissed.has(r.id));

  if (visibleReminders.length === 0) return null;

  return (
    <div className="space-y-2">
      {visibleReminders.map(reminder => {
        const Icon = reminder.icon;
        const messages = REMINDERS[reminder.type];
        const message = messages[language] ? messages[language][0] : messages.en[0];

        return (
          <div
            key={reminder.id}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: 'var(--mizan-surface)', border: `1px solid ${reminder.color}99` }}
          >
            <Icon className="w-5 h-5" style={{ color: reminder.color }} />
            <div className="flex-1">
              <p className="text-sm" style={{ color: 'var(--mizan-text)' }}>{message}</p>
            </div>
            <div className="flex gap-1.5">
              <Button
                onClick={() => trackHabit(reminder.type)}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                style={{ color: reminder.color }}
              >
                {language === 'ar' ? 'تم' : 'Done'}
              </Button>
              <Button
                onClick={() => dismissReminder(reminder.id)}
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}