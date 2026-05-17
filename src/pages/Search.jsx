import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { Search, Target, CheckSquare, Wallet, BookOpen, Activity, X, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const CATEGORY_CONFIG = {
  task:        { icon: CheckSquare,  color: 'var(--mizan-emerald)', labelAr: 'مهمة',       labelEn: 'Task',        path: '/planner' },
  goal:        { icon: Target,       color: 'var(--mizan-gold)',    labelAr: 'هدف',         labelEn: 'Goal',        path: '/goals' },
  transaction: { icon: Wallet,       color: '#12897A',              labelAr: 'معاملة',      labelEn: 'Transaction', path: '/finance' },
  course:      { icon: BookOpen,     color: 'var(--mizan-red)',     labelAr: 'دورة',        labelEn: 'Course',      path: '/learning' },
  wellness:    { icon: Activity,     color: '#27AE60',              labelAr: 'صحة',         labelEn: 'Wellness',    path: '/wellness' },
};

function ResultItem({ item, language, onClick }) {
  const cfg = CATEGORY_CONFIG[item.type] || CATEGORY_CONFIG.task;
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80 text-left"
      style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.color + '22' }}>
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--mizan-text)' }}>{item.title}</p>
        {item.subtitle && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--mizan-text-secondary)' }}>{item.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.color + '22', color: cfg.color }}>
          {language === 'ar' ? cfg.labelAr : cfg.labelEn}
        </span>
        <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
      </div>
    </button>
  );
}

const QUICK_CATEGORIES = [
  { labelAr: 'المهام',  labelEn: 'Tasks',    icon: CheckSquare, path: '/planner'  },
  { labelAr: 'الأهداف', labelEn: 'Goals',    icon: Target,      path: '/goals'    },
  { labelAr: 'المالية', labelEn: 'Finance',  icon: Wallet,      path: '/finance'  },
  { labelAr: 'الصحة',  labelEn: 'Wellness', icon: Activity,    path: '/wellness' },
  { labelAr: 'التعلم', labelEn: 'Learning', icon: BookOpen,    path: '/learning' },
];

function EmptyState({ language, allData, onSuggestion, navigate }) {
  const isAr = language === 'ar';

  const smartSuggestions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    // Always show static base suggestions
    const suggestions = [
      { ar: 'مهامك اليوم', en: "Today's tasks", query: today },
      { ar: 'أهدافك النشطة', en: 'Active goals', query: 'active' },
      { ar: 'آخر المعاملات', en: 'Recent transactions', query: '' },
    ];

    if (!allData) return suggestions;

    const overdue = allData.tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < today);
    if (overdue.length > 0)
      suggestions.push({ ar: `المهام المتأخرة (${overdue.length})`, en: `Overdue (${overdue.length})`, query: overdue[0].title });

    const activeCourses = allData.courses.filter(c => !c.is_completed);
    if (activeCourses.length > 0)
      suggestions.push({ ar: `دوراتك الجارية (${activeCourses.length})`, en: `Courses (${activeCourses.length})`, query: activeCourses[0].course_name });

    return suggestions.slice(0, 5);
  }, [allData]);

  return (
    <div className="space-y-6 pt-2" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Smart Suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--mizan-emerald)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {isAr ? 'اقتراحات ذكية' : 'Smart Suggestions'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {smartSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestion(s.query)}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: 'var(--mizan-surface)',
                border: '1px solid var(--mizan-emerald)',
                color: 'var(--mizan-emerald)',
              }}
            >
              {isAr ? s.ar : s.en}
            </button>
          ))}
          {smartSuggestions.length === 0 && (
            <p className="text-sm" style={{ color: 'var(--mizan-text-secondary)' }}>
              {isAr ? 'ابدأ بإضافة بيانات لتظهر الاقتراحات' : 'Add some data to see smart suggestions'}
            </p>
          )}
        </div>
      </div>

      {/* Quick Category Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4" style={{ color: 'var(--mizan-gold)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--mizan-text)' }}>
            {isAr ? 'بحث سريع' : 'Quick Search'}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.path}
                onClick={() => navigate(cat.path)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 flex-shrink-0"
                style={{
                  background: 'var(--mizan-emerald)18',
                  border: '1px solid var(--mizan-emerald)44',
                  color: 'var(--mizan-emerald)',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    Promise.all([
      base44.entities.Task.list('-created_date', 300),
      base44.entities.Goal.list('-created_date', 100),
      base44.entities.Transaction.list('-date', 300),
      base44.entities.CourseLog.list('-created_date', 100),
      base44.entities.WellnessLog.list('-date', 60),
    ]).then(([tasks, goals, transactions, courses, wellness]) => {
      setAllData({ tasks, goals, transactions, courses, wellness });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!allData || !query.trim()) { setResults([]); return; }
    const q = query.trim().toLowerCase();
    const matched = [];

    allData.tasks.forEach(t => {
      if ((t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)) {
        matched.push({ id: t.id, type: 'task', title: t.title, subtitle: t.due_date ? format(new Date(t.due_date), 'dd MMM yyyy') : t.status, path: '/planner' });
      }
    });
    allData.goals.forEach(g => {
      if ((g.title || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q)) {
        matched.push({ id: g.id, type: 'goal', title: g.title, subtitle: g.category, path: '/goals' });
      }
    });
    allData.transactions.forEach(tx => {
      if ((tx.description || '').toLowerCase().includes(q) || (tx.category || '').toLowerCase().includes(q)) {
        matched.push({ id: tx.id, type: 'transaction', title: tx.description || tx.category, subtitle: `${tx.type === 'income' ? '+' : '-'}${tx.amount}`, path: '/finance' });
      }
    });
    allData.courses.forEach(c => {
      if ((c.course_name || '').toLowerCase().includes(q)) {
        matched.push({ id: c.id, type: 'course', title: c.course_name, subtitle: c.platform, path: '/learning' });
      }
    });

    setResults(matched.slice(0, 20));
  }, [query, allData]);

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-screen" style={{ background: 'var(--mizan-bg)' }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <X className="w-4 h-4" style={{ color: 'var(--mizan-text-secondary)' }} />
        </button>
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl" style={{ background: 'var(--mizan-surface)', border: '1px solid var(--mizan-border)' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--mizan-text-secondary)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث في كل شيء...' : 'Search everything...'}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--mizan-text)' }}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X className="w-3.5 h-3.5" style={{ color: 'var(--mizan-text-secondary)' }} />
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-10">
          <div className="w-6 h-6 rounded-full border-2 animate-spin mx-auto" style={{ borderColor: 'var(--mizan-border)', borderTopColor: 'var(--mizan-emerald)' }} />
        </div>
      )}

      {!loading && !query && (
        <EmptyState language={language} allData={allData} onSuggestion={setQuery} onCategory={setQuery} navigate={navigate} />
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--mizan-text)' }}>
            {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
          </p>
          <p className="text-xs" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? `لم يتم العثور على نتائج لـ "${query}"` : `No results for "${query}"`}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs mb-3" style={{ color: 'var(--mizan-text-secondary)' }}>
            {language === 'ar' ? `${results.length} نتيجة` : `${results.length} results`}
          </p>
          {results.map(item => (
            <ResultItem
              key={`${item.type}-${item.id}`}
              item={item}
              language={language}
              onClick={() => navigate(item.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}