import React from 'react';
import { TrendingUp, Heart, Target, BookOpen, DollarSign, Moon } from 'lucide-react';

const CATEGORIES = [
  {
    icon: DollarSign,
    color: '#27AE60',
    suggestions: {
      ar: ['كيف وضعي المالي هذا الشهر؟', 'هل أنا قريب من تجاوز الميزانية؟', 'اقترح لي خطة توفير'],
      en: ['How is my finances this month?', 'Am I close to any budget limit?', 'Suggest a savings plan'],
    },
  },
  {
    icon: Moon,
    color: '#0B5B50',
    suggestions: {
      ar: ['كيف انتظامي في الصلاة؟', 'نصائح لتحسين المداومة على الصلاة', 'خطة لختم القرآن'],
      en: ['How is my prayer consistency?', 'Tips to improve prayer regularity', 'Quran completion plan'],
    },
  },
  {
    icon: Target,
    color: '#B89A5E',
    suggestions: {
      ar: ['ما تقدمي في الأهداف؟', 'ساعدني أُركّز على هدف هذا الأسبوع', 'اقترح لي هدفًا جديدًا'],
      en: ['What is my goals progress?', 'Help me focus on a goal this week', 'Suggest a new goal for me'],
    },
  },
  {
    icon: Heart,
    color: '#E74C3C',
    suggestions: {
      ar: ['كيف صحتي ورفاهيتي؟', 'نصائح لتحسين النوم', 'تمارين مناسبة لأسلوب حياتي'],
      en: ['How is my wellness?', 'Tips for better sleep', 'Exercises for my lifestyle'],
    },
  },
  {
    icon: BookOpen,
    color: '#8E44AD',
    suggestions: {
      ar: ['ما دوراتي الجارية؟', 'ساعدني أضع خطة تعلم', 'كيف أُعظّم وقت القراءة؟'],
      en: ['What are my active courses?', 'Help me build a learning plan', 'How to maximize reading time?'],
    },
  },
];

export default function ProactiveSuggestions({ language, onSelect }) {
  const lang = language === 'ar' ? 'ar' : 'en';

  return (
    <div className="w-full max-w-sm mx-auto space-y-2">
      {CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        const items = cat.suggestions[lang];
        return (
          <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--mizan-border)' }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: `${cat.color}15` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
            </div>
            <div className="divide-y" style={{ background: 'var(--mizan-surface)', borderColor: 'var(--mizan-border)' }}>
              {items.map((s, j) => (
                <button key={j} onClick={() => onSelect(s)}
                  className="w-full text-start px-4 py-2.5 text-xs hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--mizan-text)', display: 'block' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}