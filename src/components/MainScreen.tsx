import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserProfile,
  ScheduleItem,
  HomeworkTask,
  Announcement,
  Poll,
  GroupMeta,
  AttendanceRecord,
  AttendanceStatus,
  TelegramBinding,
  StarostaMandate,
  RucScheduleConfig,
} from '../types/starosta';
import {
  ShieldCheck,
  Send,
  Calendar,
  CheckSquare,
  Clock,
  ClipboardCheck,
  Award,
  Users,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  MessageCircle,
  Vote,
  Sparkles,
  UserCheck,
  FileCheck2,
  ChevronRight,
  Bell,
  Share2,
  AlertCircle,
  BookOpen,
  MapPin,
  User,
  Plus,
  RefreshCw,
  Building2,
  Link2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MainScreenProps {
  currentUser: UserProfile;
  users: UserProfile[];
  groupMeta: GroupMeta;
  telegramBinding: TelegramBinding;
  starostaMandate: StarostaMandate;
  rucConfig?: RucScheduleConfig;
  schedule: ScheduleItem[];
  homework: HomeworkTask[];
  announcements: Announcement[];
  polls: Poll[];
  attendanceRecords: AttendanceRecord[];
  onOpenProfile: (user: UserProfile) => void;
  onEditProfile: () => void;
  onOpenSignModal: () => void;
  onOpenTelegramModal: () => void;
  onOpenRucSync?: () => void;
  onOpenUserSwitcher: () => void;
  onOpenAI: () => void;
  onUpdateAttendance: (rec: AttendanceRecord) => void;
  onToggleHomework: (taskId: string, userId: string) => void;
  onVotePoll: (pollId: string, optionId: string, userId: string) => void;
  onToggleReaction: (annId: string, emoji: string, userId: string) => void;
  onAddComment: (annId: string, text: string) => void;
  onNavigateTab?: (tab: 'main' | 'schedule' | 'homework' | 'attendance' | 'channel' | 'group') => void;
}

type MainTab = 'attendance' | 'schedule' | 'homework' | 'channel' | 'group';

const DAYS = [
  { id: 1, name: 'Пн', full: 'Понедельник' },
  { id: 2, name: 'Вт', full: 'Вторник' },
  { id: 3, name: 'Ср', full: 'Среда' },
  { id: 4, name: 'Чт', full: 'Четверг' },
  { id: 5, name: 'Пт', full: 'Пятница' },
  { id: 6, name: 'Сб', full: 'Суббота' },
];

export const MainScreen: React.FC<MainScreenProps> = ({
  currentUser,
  users,
  groupMeta,
  telegramBinding,
  starostaMandate,
  rucConfig,
  schedule,
  homework,
  announcements,
  polls,
  attendanceRecords,
  onOpenProfile,
  onEditProfile,
  onOpenSignModal,
  onOpenTelegramModal,
  onOpenRucSync,
  onOpenUserSwitcher,
  onOpenAI,
  onUpdateAttendance,
  onToggleHomework,
  onVotePoll,
  onToggleReaction,
  onAddComment,
  onNavigateTab,
}) => {
  // Main Tab navigation state
  const [activeTab, setActiveTab] = useState<MainTab>('attendance');

  // Attendance sub-states
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [selectedSubgroup, setSelectedSubgroup] = useState<'all' | 1 | 2>('all');
  const [selectedPairNum, setSelectedPairNum] = useState<number>(1);

  // Schedule sub-states
  const todayDay = new Date().getDay() === 0 ? 1 : new Date().getDay();
  const [scheduleDay, setScheduleDay] = useState<number>(todayDay <= 6 ? todayDay : 1);
  const [weekType, setWeekType] = useState<'both' | 'numerator' | 'denominator'>('both');
  const [scheduleSubgroupFilter, setScheduleSubgroupFilter] = useState<'all' | 1 | 2>('all');

  // Dual Starosta switch (Староста 1 п/гр vs Староста 2 п/гр)
  const [activeStarostaView, setActiveStarostaView] = useState<1 | 2>(
    currentUser.subgroup === 2 ? 2 : 1
  );

  // Homework sub-states
  const [homeworkFilter, setHomeworkFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Channel comments sub-state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentSection, setActiveCommentSection] = useState<string | null>(null);

  // Find Both Starostas of БИ(ЭБ) 1/2
  const starosta1 =
    users.find((u) => u.id === 'user-1') ||
    users.find((u) => u.subgroup === 1 && (u.role === 'starosta' || u.role === 'deputy')) ||
    users[0];

  const starosta2 =
    users.find((u) => u.id === 'user-2') ||
    users.find((u) => u.subgroup === 2 && (u.role === 'starosta' || u.role === 'deputy')) ||
    users[1] ||
    users[0];

  const starostaUser = activeStarostaView === 1 ? starosta1 : starosta2;
  const isCurrentUserStarosta =
    currentUser.id === starosta1.id ||
    currentUser.id === starosta2.id ||
    currentUser.role === 'starosta';

  // Today's classes
  const todayClasses = schedule.filter((s) => s.dayOfWeek === scheduleDay);
  const filteredSchedule = schedule
    .filter((s) => {
      if (s.dayOfWeek !== scheduleDay) return false;
      if (weekType !== 'both' && s.weekType !== 'both' && s.weekType !== weekType) return false;
      if (scheduleSubgroupFilter !== 'all' && s.subgroup && s.subgroup !== scheduleSubgroupFilter) return false;
      return true;
    })
    .sort((a, b) => a.pairNumber - b.pairNumber);

  // Today's attendance record
  const todayStr = '2026-11-05';
  const currentPairRecord = attendanceRecords.find(
    (r) => r.date === todayStr && r.pairNumber === selectedPairNum
  ) || {
    id: `att-${todayStr}-${selectedPairNum}`,
    date: todayStr,
    pairNumber: selectedPairNum,
    subject: todayClasses.find((c) => c.pairNumber === selectedPairNum)?.subject || 'Базы данных и проектирование ИС',
    records: {},
    updatedAt: new Date().toISOString(),
  };

  const getStatus = (userId: string): AttendanceStatus => {
    return currentPairRecord.records[userId] || 'present';
  };

  const handleSetStatus = (userId: string, status: AttendanceStatus) => {
    onUpdateAttendance({
      ...currentPairRecord,
      records: {
        ...currentPairRecord.records,
        [userId]: status,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    users
      .filter((u) => u.role !== 'curator')
      .forEach((u) => {
        updated[u.id] = 'present';
      });

    onUpdateAttendance({
      ...currentPairRecord,
      records: updated,
      updatedAt: new Date().toISOString(),
    });

    try {
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleCopyReport = () => {
    const students = users.filter((u) => u.role !== 'curator');
    const absent = students.filter((u) => getStatus(u.id) === 'absent').map((u) => u.name).join(', ') || 'нет';
    const excused = students.filter((u) => getStatus(u.id) === 'excused').map((u) => `${u.name} (справка)`).join(', ') || 'нет';
    const late = students.filter((u) => getStatus(u.id) === 'late').map((u) => u.name).join(', ') || 'нет';

    const presentCount = students.filter((u) => getStatus(u.id) === 'present' || getStatus(u.id) === 'late').length;
    const percent = Math.round((presentCount / students.length) * 100);

    const report =
      `📋 **РАПОРТИЧКА ПОСЕЩАЕМОСТИ — ГРУППА ${groupMeta.code}**\n` +
      `📅 Дата: ${todayStr} | Пара №${selectedPairNum}\n` +
      `📚 Предмет: ${currentPairRecord.subject}\n` +
      `👥 Всего: ${students.length} чел. | Присутствуют: ${presentCount} (${percent}%)\n` +
      `❌ Отсутствуют: ${absent}\n` +
      `📝 По уважительной: ${excused}\n` +
      `⏰ Опоздали: ${late}\n\n` +
      `Подписано старостой: ${starostaMandate.signatureText || starostaUser.name} (${starostaUser.username})\n` +
      `Отправлено через Telegram-бот @Starosta24_bot`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleCopyInvite = () => {
    const invite = `https://t.me/Starosta24_bot?start=group_${groupMeta.code.replace(/[^a-zA-Z0-9]/g, '_')}`;
    navigator.clipboard.writeText(invite);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleSendComment = (annId: string) => {
    const text = commentInputs[annId]?.trim();
    if (!text) return;
    onAddComment(annId, text);
    setCommentInputs((prev) => ({ ...prev, [annId]: '' }));
  };

  // Badges
  const pendingHomeworkCount = homework.filter((t) => !t.completedByUserIds.includes(currentUser.id)).length;
  const filteredHomework = homework.filter((t) => {
    const isDone = t.completedByUserIds.includes(currentUser.id);
    if (homeworkFilter === 'pending') return !isDone;
    if (homeworkFilter === 'completed') return isDone;
    return true;
  });

  const mainTabs = [
    { id: 'attendance' as MainTab, label: 'Журнал', icon: ClipboardCheck },
    { id: 'schedule' as MainTab, label: 'Расписание', icon: Calendar },
    {
      id: 'homework' as MainTab,
      label: 'Задания',
      icon: CheckSquare,
      badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined,
    },
    { id: 'channel' as MainTab, label: 'Канал', icon: MessageCircle },
    { id: 'group' as MainTab, label: 'Группа', icon: Users },
  ];

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-12 select-none animate-fade-in">
      {/* 1. HERO CARD: СТАРОСТА ГРУППЫ И ПОДПИСАНИЕ ПОЛНОМОЧИЙ */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl p-5 border border-amber-500/30 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dual Starostas Switcher: 1 п/гр (Дмитрий) & 2 п/гр (Анна) */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-amber-500/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveStarostaView(1)}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeStarostaView === 1 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 1 п/гр: {starosta1.name.split(' ')[0]}</span>
            {currentUser.id === starosta1.id && <span className="text-[10px] bg-slate-950/20 px-1 rounded font-normal">(Вы)</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveStarostaView(2)}
            className={`flex-1 py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeStarostaView === 2 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 2 п/гр: {starosta2.name.split(' ')[0]}</span>
            {currentUser.id === starosta2.id && <span className="text-[10px] bg-slate-950/20 px-1 rounded font-normal">(Вы)</span>}
          </button>
        </div>

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3.5 min-w-0">
            <button
              onClick={() => onOpenProfile(starostaUser)}
              className="relative shrink-0 group"
              title="Открыть профиль старосты"
            >
              <img
                src={starostaUser.avatar}
                alt={starostaUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-md group-hover:scale-105 transition"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {activeStarostaView === 1 ? 'Староста 1 п/гр' : 'Староста 2 п/гр'}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-md font-mono">
                  {groupMeta.code}
                </span>
                <span className="text-[10px] text-amber-400/90 font-mono">
                  РУК 2026
                </span>
              </div>

              <h2 className="text-base font-extrabold text-white tracking-tight leading-snug mt-1 truncate">
                {starostaUser.name}
              </h2>
              <p className="text-xs font-semibold text-sky-400 font-mono">
                {starostaUser.username}
              </p>
            </div>
          </div>

          <button
            onClick={onEditProfile}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-sky-400 rounded-xl transition active:scale-95 shrink-0"
            title="Редактировать мой профиль"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Short Bio */}
        {starostaUser.bio && (
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
            "{starostaUser.bio}"
          </div>
        )}

        {/* Starosta Mandate & Signature Seal */}
        <div className="bg-slate-950/90 rounded-2xl p-3 border border-amber-500/25 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-300">
                {starostaMandate.isSigned ? 'Полномочия старосты утверждены' : 'Мандат не подписан'}
              </div>
              <div className="text-[11px] text-slate-400">
                Подпись: <span className="font-mono text-white font-semibold">{starostaMandate.signatureText || starostaUser.name}</span> • {starostaMandate.orderNumber || 'Протокол группы'}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenSignModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>{isCurrentUserStarosta ? 'Обновить подпись' : 'Подписать себя старостой'}</span>
          </button>
        </div>
      </section>

      {/* 2. ПРИВЯЗКА TELEGRAM И СЕРВИСОВ («Привязка ТГ и т.п.») */}
      <section className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 rounded-3xl p-4 border border-sky-500/30 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Telegram & Бот старостата</span>
                <span className={`w-2 h-2 rounded-full ${telegramBinding.botToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              </h3>
              <p className="text-[11px] text-sky-300">
                {telegramBinding.botUsername ? `Бот ${telegramBinding.botUsername} подключен` : 'Синхронизация по Bot Token (@BotFather)'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTelegramModal}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-xl transition active:scale-95"
          >
            {telegramBinding.botToken ? 'Консоль / Бот' : 'Ввести токен'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Telegram старосты:</span>
            <span className="font-mono text-sky-400 font-bold">{telegramBinding.telegramUsername || starostaUser.username}</span>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Bot Token:</span>
            <span className={`text-[11px] font-bold flex items-center gap-1 ${telegramBinding.botToken ? 'text-emerald-400' : 'text-amber-400'}`}>
              <Check className="w-3 h-3" />
              {telegramBinding.botToken ? (telegramBinding.botUsername || 'Подключен') : 'Не настроен'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button
            onClick={onOpenTelegramModal}
            className="flex-1 min-w-[140px] py-2 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Тест команд бота (/journal, /schedule)</span>
          </button>

          <button
            onClick={handleCopyInvite}
            className="flex-1 min-w-[130px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            {copiedInvite ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ссылка скопирована!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Ссылка для группы</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 3. АНИМИРОВАННЫЙ СЕГМЕНТИРОВАННЫЙ ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК НА ГЛАВНОМ ЭКРАНЕ */}
      <div className="sticky top-14 z-30 bg-slate-950/90 backdrop-blur-md pt-2 pb-1">
        <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 relative shadow-md">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 relative z-10 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Smooth Animated Indicator Pill behind active tab */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-sky-600 rounded-xl shadow-md shadow-sky-600/30 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] truncate tracking-tight">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. ПЛАВНЫЙ АНИМИРОВАННЫЙ КОНТЕНТ ВКЛАДОК (AnimatePresence) */}
      <div className="min-h-[380px]">
        <AnimatePresence mode="wait">
          {/* TAB 1: ЖУРНАЛ ПОСЕЩАЕМОСТИ */}
          {activeTab === 'attendance' && (
            <motion.section
              key="tab-attendance"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900/90 rounded-3xl p-4 border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Журнал посещаемости</h3>
                    <p className="text-[11px] text-slate-400">
                      Пара №{selectedPairNum}: {currentPairRecord.subject}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyReport}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                    copiedReport ? 'bg-emerald-600 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Скопировано!' : 'Рапортичка'}</span>
                </button>
              </div>

              {/* Pair Selector */}
              <div className="flex items-center justify-between gap-1 pt-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 pl-1 font-medium">Пара:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setSelectedPairNum(num)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        selectedPairNum === num
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      №{num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subgroup buttons & All Present fast button */}
              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setSelectedSubgroup('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      selectedSubgroup === 'all' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setSelectedSubgroup(1)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      selectedSubgroup === 1 ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1 п/гр
                  </button>
                  <button
                    onClick={() => setSelectedSubgroup(2)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                      selectedSubgroup === 2 ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2 п/гр
                  </button>
                </div>

                <button
                  onClick={handleMarkAllPresent}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-semibold transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Все здесь</span>
                </button>
              </div>

              {/* Students list */}
              <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {users
                  .filter((u) => u.role !== 'curator')
                  .filter((u) => selectedSubgroup === 'all' || u.subgroup === selectedSubgroup)
                  .map((student) => {
                    const status = getStatus(student.id);

                    return (
                      <div
                        key={student.id}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 hover:border-slate-700 transition"
                      >
                        <button
                          onClick={() => onOpenProfile(student)}
                          className="flex items-center gap-2.5 text-left min-w-0 flex-1 group"
                          title={`Профиль ${student.name}`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700 group-hover:ring-sky-400 transition"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                                status === 'present'
                                  ? 'bg-emerald-500'
                                  : status === 'absent'
                                  ? 'bg-rose-500'
                                  : status === 'excused'
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-500'
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white group-hover:text-sky-300 transition truncate">
                              {student.name}
                            </div>
                            <div className="text-[10px] text-sky-400 font-mono truncate">
                              {student.username}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleSetStatus(student.id, 'present')}
                            title="Был"
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition active:scale-90 ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
                            }`}
                          >
                            Б
                          </button>
                          <button
                            onClick={() => handleSetStatus(student.id, 'absent')}
                            title="Отсутствует (н/б)"
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition active:scale-90 ${
                              status === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                            }`}
                          >
                            Н
                          </button>
                          <button
                            onClick={() => handleSetStatus(student.id, 'excused')}
                            title="Уважительная (справка)"
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition active:scale-90 ${
                              status === 'excused'
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                            }`}
                          >
                            У
                          </button>
                          <button
                            onClick={() => handleSetStatus(student.id, 'late')}
                            title="Опоздал"
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition active:scale-90 ${
                              status === 'late'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-400 hover:text-indigo-400'
                            }`}
                          >
                            О
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.section>
          )}

          {/* TAB 2: РАСПИСАНИЕ ПАР */}
          {activeTab === 'schedule' && (
            <motion.section
              key="tab-schedule"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900/90 rounded-3xl p-4 border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Сетка занятий</h3>
                    <p className="text-[11px] text-slate-400">
                      {DAYS.find((d) => d.id === scheduleDay)?.full}
                    </p>
                  </div>
                </div>

                {/* Week Type Toggle */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setWeekType('both')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                      weekType === 'both' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setWeekType('numerator')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                      weekType === 'numerator' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    Числитель
                  </button>
                  <button
                    onClick={() => setWeekType('denominator')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                      weekType === 'denominator' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    Знаменатель
                  </button>
                </div>
              </div>

              {/* RUC Schedule Portal Integration Card */}
              <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-sky-500/30 flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>schedule.ruc.su</span>
                      <span className="text-[10px] text-sky-400 font-mono font-normal">
                        ({groupMeta.code} • РУК Краснодар 2026)
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Автодобавление расписания для 1 и 2 подгрупп
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenRucSync}
                  className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 active:scale-95 shrink-0 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Обновить с сайта</span>
                </button>
              </div>

              {/* Subgroup Selector in Schedule */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setScheduleSubgroupFilter('all')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    scheduleSubgroupFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Все пары (1 и 2 п/гр)
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleSubgroupFilter(1)}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    scheduleSubgroupFilter === 1 ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1 п/гр ({starosta1.name.split(' ')[0]})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleSubgroupFilter(2)}
                  className={`flex-1 py-1 rounded-lg font-semibold transition ${
                    scheduleSubgroupFilter === 2 ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2 п/гр ({starosta2.name.split(' ')[0]})
                </button>
              </div>

              {/* Day of Week Animated Switcher */}
              <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                {DAYS.map((day) => {
                  const isSelected = scheduleDay === day.id;
                  const isRealToday = todayDay === day.id;

                  return (
                    <motion.button
                      key={day.id}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setScheduleDay(day.id)}
                      className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition relative ${
                        isSelected
                          ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/30'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{day.name}</span>
                      {isRealToday && (
                        <span className={`text-[8px] mt-0.5 px-1 rounded ${isSelected ? 'bg-white/20' : 'text-sky-400'}`}>
                          сегодня
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Schedule List */}
              <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {filteredSchedule.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    В этот день занятий для выбранной подгруппы нет.
                  </div>
                ) : (
                  filteredSchedule.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        idx === 0 && scheduleDay === todayDay
                          ? 'bg-sky-950/30 border-sky-500/40 ring-1 ring-sky-500/20'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {item.pairNumber}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span className="truncate">{item.subject}</span>
                            {item.subgroup ? (
                              <span className="text-[9px] bg-sky-950 text-sky-300 border border-sky-800/40 px-1 py-0.2 rounded font-mono shrink-0">
                                {item.subgroup} п/гр
                              </span>
                            ) : (
                              <span className="text-[9px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-1 py-0.2 rounded font-mono shrink-0">
                                Общая
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.teacher} • <span className="text-sky-400 font-medium">{item.auditorium}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {item.timeStart} – {item.timeEnd}
                        </span>
                        {idx === 0 && scheduleDay === todayDay && (
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Сейчас
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.section>
          )}

          {/* TAB 3: ЗАДАНИЯ И ДЕДЛАЙНЫ */}
          {activeTab === 'homework' && (
            <motion.section
              key="tab-homework"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900/90 rounded-3xl p-4 border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Домашние задания</h3>
                    <p className="text-[11px] text-slate-400">Контроль сдачи работ</p>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setHomeworkFilter('all')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                      homeworkFilter === 'all' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setHomeworkFilter('pending')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                      homeworkFilter === 'pending' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    Надо сдать
                  </button>
                  <button
                    onClick={() => setHomeworkFilter('completed')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                      homeworkFilter === 'completed' ? 'bg-slate-800 text-sky-400' : 'text-slate-400'
                    }`}
                  >
                    Сдано
                  </button>
                </div>
              </div>

              {/* Tasks list */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {filteredHomework.map((task) => {
                  const isCompleted = task.completedByUserIds.includes(currentUser.id);
                  const submitters = users.filter((u) => task.completedByUserIds.includes(u.id));

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 space-y-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/40">
                          {task.subject}
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          до {task.deadline}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white">{task.title}</div>
                      {task.description && (
                        <p className="text-[11px] text-slate-300 line-clamp-2 italic bg-slate-900/50 p-2 rounded-xl">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        {/* Classmates submitters */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Сдали ({submitters.length}):</span>
                          <div className="flex items-center -space-x-1">
                            {submitters.slice(0, 4).map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => onOpenProfile(sub)}
                                className="hover:scale-110 transition"
                                title={`${sub.name} (${sub.username})`}
                              >
                                <img
                                  src={sub.avatar}
                                  alt={sub.name}
                                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-900"
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleHomework(task.id, currentUser.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isCompleted ? 'Сдано ✅' : 'Отметить сдачу'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* TAB 4: КАНАЛ ОБЪЯВЛЕНИЙ И ЧАТ */}
          {activeTab === 'channel' && (
            <motion.section
              key="tab-channel"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900/90 rounded-3xl p-4 border border-slate-800 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-500/15 text-sky-400 rounded-xl">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Канал группы</h3>
                    <p className="text-[11px] text-slate-400">Синхронизировано с Telegram</p>
                  </div>
                </div>

                <button
                  onClick={onOpenAI}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ИИ-помощник</span>
                </button>
              </div>

              {/* Announcements stream */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {announcements.map((ann) => {
                  const author = users.find((u) => u.id === ann.authorId) || currentUser;
                  const isCommentsOpen = activeCommentSection === ann.id;

                  return (
                    <div
                      key={ann.id}
                      className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => onOpenProfile(author)}
                          className="flex items-center gap-2 group text-left"
                        >
                          <img
                            src={author.avatar}
                            alt={author.name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-sky-400"
                          />
                          <span className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                            {author.name} <span className="font-mono text-slate-500">({author.username})</span>
                          </span>
                        </button>
                        <span className="text-[10px] text-slate-500">{ann.timestamp}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </p>

                      {/* Reactions */}
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {['👍', '🔥', '❤️', '🫡'].map((emoji) => {
                          const count = (ann.reactions[emoji] || []).length;
                          return (
                            <button
                              key={emoji}
                              onClick={() => onToggleReaction(ann.id, emoji, currentUser.id)}
                              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs flex items-center gap-1 transition"
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="font-mono text-[10px] text-slate-400">{count}</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Comments toggle */}
                      <div className="pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => setActiveCommentSection(isCommentsOpen ? null : ann.id)}
                          className="text-[11px] text-sky-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{ann.comments.length > 0 ? `Комментарии (${ann.comments.length})` : 'Комментировать'}</span>
                        </button>
                      </div>

                      {/* Expandable comments */}
                      {isCommentsOpen && (
                        <div className="space-y-2 pt-1 animate-fade-in">
                          {ann.comments.map((c) => {
                            const cAuthor = users.find((u) => u.id === c.authorId) || currentUser;
                            return (
                              <div key={c.id} className="bg-slate-900 p-2 rounded-xl text-xs flex items-start gap-2">
                                <button onClick={() => onOpenProfile(cAuthor)} className="shrink-0 mt-0.5">
                                  <img src={cAuthor.avatar} alt={cAuthor.name} className="w-5 h-5 rounded-full object-cover" />
                                </button>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-[11px] text-white">{cAuthor.name}:</div>
                                  <div className="text-slate-300 text-[11px]">{c.text}</div>
                                </div>
                              </div>
                            );
                          })}

                          <div className="flex gap-1.5 pt-1">
                            <input
                              type="text"
                              placeholder="Написать ответ..."
                              value={commentInputs[ann.id] || ''}
                              onChange={(e) => setCommentInputs({ ...commentInputs, [ann.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendComment(ann.id)}
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                            />
                            <button
                              onClick={() => handleSendComment(ann.id)}
                              className="px-3 py-1 bg-sky-600 text-white rounded-xl text-xs font-semibold"
                            >
                              Отправить
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* TAB 5: ГРУППА И ОПРОСЫ */}
          {activeTab === 'group' && (
            <motion.section
              key="tab-group"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="bg-slate-900/90 rounded-3xl p-4 border border-slate-800 shadow-lg space-y-4"
            >
              {/* Polls Block */}
              {polls[0] && (
                <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Vote className="w-4 h-4 text-purple-400" />
                    <span>Активный опрос группы</span>
                  </div>
                  <div className="text-xs font-bold text-white">{polls[0].question}</div>
                  <div className="space-y-1.5">
                    {polls[0].options.map((opt) => {
                      const isMyVote = opt.votedUserIds.includes(currentUser.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => onVotePoll(polls[0].id, opt.id, currentUser.id)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between gap-2 ${
                            isMyVote
                              ? 'border-sky-500 bg-sky-950/40 text-white font-bold'
                              : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate">{opt.text}</span>
                          <span className="font-mono text-[11px] text-sky-400 shrink-0">
                            {opt.votedUserIds.length} гол.
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Students Roster with Profile View */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                  <span>Одногруппники ({users.length} чел.)</span>
                  <span className="text-[10px] text-sky-400">Нажмите для открытия профиля</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {users.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => onOpenProfile(student)}
                      className="w-full bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2.5 text-left transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{student.name}</span>
                            {student.role === 'starosta' && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                                Староста
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-sky-400 font-mono truncate">{student.username}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400">{student.subgroup} п/гр</div>
                        <div className="text-[10px] text-emerald-400 font-bold">{student.attendanceRate}% явка</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Switcher reminder */}
      <div className="pt-2 text-center text-xs text-slate-500">
        Вы вошли как:{' '}
        <button onClick={onOpenUserSwitcher} className="text-sky-400 font-semibold underline">
          {currentUser.name} ({currentUser.username})
        </button>{' '}
        • Староста 24 Android
      </div>
    </div>
  );
};
