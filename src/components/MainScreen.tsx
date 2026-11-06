import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Edit3,
  ExternalLink,
  MessageCircle,
  FileCheck2,
  ChevronRight,
  Bell,
  MapPin,
  RefreshCw,
  Sparkles,
  Check,
  BookOpen,
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
  onNavigateTab,
}) => {
  // Dual Starosta switch (Староста 1 п/гр vs Староста 2 п/гр)
  const [activeStarostaView, setActiveStarostaView] = useState<1 | 2>(
    currentUser.subgroup === 2 ? 2 : 1
  );

  // Starostas of БИ(ЭБ) 1/2
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

  // Badges & metrics
  const pendingHomeworkCount = homework.filter(
    (t) => !t.completedByUserIds.includes(currentUser.id)
  ).length;

  const todayDay = new Date().getDay() === 0 ? 1 : new Date().getDay();
  const todayClasses = schedule.filter((s) => s.dayOfWeek === todayDay);
  const currentPair = todayClasses[0] || schedule[0];

  const todayStr = '2026-11-05';
  const todayAttendance = attendanceRecords.find((r) => r.date === todayStr && r.pairNumber === 1);
  const studentsCount = users.filter((u) => u.role !== 'curator').length;
  const presentCount = todayAttendance
    ? Object.values(todayAttendance.records).filter((s) => s === 'present' || s === 'late').length
    : studentsCount;

  const pinnedAnnouncement = announcements.find((a) => a.pinned) || announcements[0];

  const handleMarkAllFast = () => {
    const updated: Record<string, AttendanceStatus> = {};
    users
      .filter((u) => u.role !== 'curator')
      .forEach((u) => {
        updated[u.id] = 'present';
      });

    onUpdateAttendance({
      id: `att-${todayStr}-1`,
      date: todayStr,
      pairNumber: 1,
      subject: currentPair?.subject || 'Базы данных и проектирование ИС',
      records: updated,
      updatedAt: new Date().toISOString(),
    });

    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-3 space-y-3 max-w-lg mx-auto pb-6 select-none animate-fade-in text-xs">
      {/* 1. COMPACT HERO: ДВА СТАРОСТЫ ГРУППЫ БИ(ЭБ) 1/2 */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 rounded-2xl p-3 border border-amber-500/30 shadow-md space-y-2.5 relative overflow-hidden">
        {/* Subgroup Starosta Switcher */}
        <div className="flex bg-slate-950/80 p-0.5 rounded-xl border border-amber-500/25">
          <button
            type="button"
            onClick={() => setActiveStarostaView(1)}
            className={`flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition text-[11px] ${
              activeStarostaView === 1 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 1 п/гр: {starosta1.name.split(' ')[0]}</span>
            {currentUser.id === starosta1.id && <span className="text-[9px] opacity-75">(Вы)</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveStarostaView(2)}
            className={`flex-1 py-1 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition text-[11px] ${
              activeStarostaView === 2 ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 2 п/гр: {starosta2.name.split(' ')[0]}</span>
            {currentUser.id === starosta2.id && <span className="text-[9px] opacity-75">(Вы)</span>}
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => onOpenProfile(starostaUser)}
              className="relative shrink-0"
              title="Открыть профиль"
            >
              <img
                src={starostaUser.avatar}
                alt={starostaUser.name}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-400/80"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                  {activeStarostaView === 1 ? 'Староста 1 п/гр' : 'Староста 2 п/гр'}
                </span>
                <span className="text-[9px] text-slate-400 bg-slate-800 px-1 py-0.2 rounded font-mono">
                  {groupMeta.code}
                </span>
                <span className="text-[9px] text-amber-400 font-mono">
                  РУК 2026
                </span>
              </div>

              <h2 className="text-[13px] font-bold text-white tracking-tight leading-snug mt-0.5 truncate">
                {starostaUser.name}
              </h2>
              <p className="text-[10px] text-sky-400 font-mono">
                {starostaUser.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onEditProfile}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 rounded-lg transition"
              title="Редактировать профиль"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenSignModal}
              className="px-2 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] transition flex items-center gap-1"
            >
              <FileCheck2 className="w-3 h-3" />
              <span>{isCurrentUserStarosta ? 'Подпись' : 'Мандат'}</span>
            </button>
          </div>
        </div>

        {/* Mandate Bar */}
        <div className="bg-slate-950/80 rounded-xl px-2.5 py-1.5 border border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Мандат: <strong className="text-amber-300">{starostaMandate.isSigned ? 'Утвержден' : 'Ожидает'}</strong></span>
          </span>
          <span className="text-slate-400 font-mono">
            {starostaMandate.orderNumber || 'Протокол группы'}
          </span>
        </div>
      </section>

      {/* 2. НАВИГАЦИЯ ПО ОТДЕЛЬНЫМ ВКЛАДКАМ (КНОПКИ ВХОДА) */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400">
          <span>Разделы приложения</span>
          <span className="text-[10px] text-sky-400 font-normal">Выберите нужную вкладку</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Schedule */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('schedule')}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/50 rounded-xl text-left transition active:scale-98 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-sky-500/15 text-sky-400 rounded-lg group-hover:scale-105 transition">
                <Calendar className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs">Расписание</div>
              <div className="text-[10px] text-slate-400 truncate">
                {todayClasses.length > 0 ? `${todayClasses.length} пар сегодня • РУК` : 'Сетка занятий Пн–Сб'}
              </div>
            </div>
          </button>

          {/* Homework */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('homework')}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left transition active:scale-98 group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg group-hover:scale-105 transition">
                <CheckSquare className="w-4 h-4" />
              </div>
              {pendingHomeworkCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500/90 text-white font-bold rounded text-[9px]">
                  {pendingHomeworkCount} сдать
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs">Задания / ДЗ</div>
              <div className="text-[10px] text-slate-400 truncate">
                {homework.length} заданий • Дедлайны
              </div>
            </div>
          </button>

          {/* Attendance Journal */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('attendance')}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition active:scale-98 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-amber-500/15 text-amber-400 rounded-lg group-hover:scale-105 transition">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs">Журнал старосты</div>
              <div className="text-[10px] text-slate-400 truncate">
                {presentCount}/{studentsCount} чел. на паре
              </div>
            </div>
          </button>

          {/* Group Tab */}
          <button
            onClick={() => onNavigateTab && onNavigateTab('group')}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition active:scale-98 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-1.5 bg-indigo-500/15 text-indigo-400 rounded-lg group-hover:scale-105 transition">
                <Users className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
            </div>
            <div className="mt-2">
              <div className="font-bold text-white text-xs">Группа БИ(ЭБ) 1/2</div>
              <div className="text-[10px] text-slate-400 truncate">
                {studentsCount} студентов • Опросы
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 3. КАРТОЧКА ТЕКУЩЕЙ ПАРЫ СЕГОДНЯ */}
      {currentPair && (
        <section className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Пара №{currentPair.pairNumber} сегодня ({currentPair.timeStart}–{currentPair.timeEnd})</span>
            </span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('schedule')}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
            >
              Всё расписание $\rightarrow$
            </button>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-slate-100 truncate text-xs">{currentPair.subject}</div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{currentPair.teacher}</span>
                <span>•</span>
                <span className="text-amber-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {currentPair.auditorium}
                </span>
              </div>
            </div>

            <button
              onClick={handleMarkAllFast}
              className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded-lg text-[10px] font-bold shrink-0 transition"
              title="Отметить всех присутствующими на этой паре"
            >
              Все здесь ✓
            </button>
          </div>
        </section>
      )}

      {/* 4. СИНХРОНИЗАЦИЯ РУК И TELEGRAM СТАТУС */}
      <section className="bg-gradient-to-r from-sky-950/30 via-slate-900 to-teal-950/30 rounded-2xl p-3 border border-sky-500/25 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
              <Send className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>Telegram & schedule.ruc.su</span>
                <span className={`w-2 h-2 rounded-full ${telegramBinding.botToken ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <div className="text-[10px] text-slate-400">
                {telegramBinding.botToken ? `@${telegramBinding.botUsername || 'Starosta24_bot'} активен` : 'Подключите Telegram-бот старосты'}
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            {onOpenRucSync && (
              <button
                onClick={onOpenRucSync}
                className="px-2 py-1 bg-teal-600/25 hover:bg-teal-600/40 text-teal-300 border border-teal-500/30 rounded-lg text-[10px] font-semibold transition"
              >
                РУК Синхр.
              </button>
            )}

            <button
              onClick={onOpenTelegramModal}
              className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-semibold transition"
            >
              {telegramBinding.botToken ? 'Бот' : 'Токен'}
            </button>
          </div>
        </div>
      </section>

      {/* 5. ПОСЛЕДНЕЕ ОБЪЯВЛЕНИЕ В КАНАЛЕ */}
      {pinnedAnnouncement && (
        <section className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Канал группы: {pinnedAnnouncement.title}</span>
            </span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('channel')}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
            >
              В канал $\rightarrow$
            </button>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
            {pinnedAnnouncement.content}
          </p>
        </section>
      )}
    </div>
  );
};
