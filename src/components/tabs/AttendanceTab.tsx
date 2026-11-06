import React, { useState } from 'react';
import {
  UserProfile,
  AttendanceRecord,
  AttendanceStatus,
  ScheduleItem,
} from '../../types/starosta';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Share2,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AttendanceTabProps {
  users: UserProfile[];
  currentUser: UserProfile;
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (updated: AttendanceRecord) => void;
  schedule: ScheduleItem[];
  onOpenProfile: (user: UserProfile) => void;
  onOpenUserSwitcher: () => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  users,
  currentUser,
  attendanceRecords,
  onUpdateAttendance,
  schedule,
  onOpenProfile,
  onOpenUserSwitcher,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-11-05');
  const [selectedPair, setSelectedPair] = useState<number>(1);
  const [subgroupFilter, setSubgroupFilter] = useState<'all' | 1 | 2>('all');
  const [copiedReport, setCopiedReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find or create record for date and pair
  const currentRecord = attendanceRecords.find(
    (r) => r.date === selectedDate && r.pairNumber === selectedPair
  ) || {
    id: `att-${selectedDate}-${selectedPair}`,
    date: selectedDate,
    pairNumber: selectedPair,
    subject:
      schedule.find((s) => s.pairNumber === selectedPair)?.subject ||
      'Текущее занятие',
    teacher:
      schedule.find((s) => s.pairNumber === selectedPair)?.teacher ||
      'Преподаватель кафедры',
    records: {},
    updatedAt: new Date().toISOString(),
  };

  // Filter students based on subgroup and search
  const filteredStudents = users.filter((u) => {
    if (u.role === 'curator') return false; // Curator is not marked in attendance
    if (subgroupFilter !== 'all' && u.subgroup !== subgroupFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatus = (userId: string): AttendanceStatus => {
    return currentRecord.records[userId] || 'present';
  };

  const handleSetStatus = (userId: string, status: AttendanceStatus) => {
    const updatedRecords = {
      ...currentRecord.records,
      [userId]: status,
    };
    onUpdateAttendance({
      ...currentRecord,
      records: updatedRecords,
      updatedAt: new Date().toISOString(),
    });
  };

  // Mark all filtered present
  const handleMarkAllPresent = () => {
    const newRecords = { ...currentRecord.records };
    filteredStudents.forEach((student) => {
      newRecords[student.id] = 'present';
    });
    onUpdateAttendance({
      ...currentRecord,
      records: newRecords,
      updatedAt: new Date().toISOString(),
    });
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  // Compute stats
  const totalStudents = filteredStudents.length;
  const presentCount = filteredStudents.filter((u) => getStatus(u.id) === 'present').length;
  const absentCount = filteredStudents.filter((u) => getStatus(u.id) === 'absent').length;
  const excusedCount = filteredStudents.filter((u) => getStatus(u.id) === 'excused').length;
  const lateCount = filteredStudents.filter((u) => getStatus(u.id) === 'late').length;
  const percentage = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 100;

  // Copy Dean Office Report
  const handleCopyReport = () => {
    const absentList = filteredStudents
      .filter((u) => getStatus(u.id) === 'absent')
      .map((u) => u.name)
      .join(', ');
    const excusedList = filteredStudents
      .filter((u) => getStatus(u.id) === 'excused')
      .map((u) => `${u.name} (справка)`)
      .join(', ');
    const lateList = filteredStudents
      .filter((u) => getStatus(u.id) === 'late')
      .map((u) => u.name)
      .join(', ');

    const reportText = `📋 **РАПОРТИЧКА ПОСЕЩАЕМОСТИ ГРУППЫ**\n` +
      `📅 Дата: ${selectedDate} | Пара №${selectedPair}\n` +
      `📚 Предмет: ${currentRecord.subject}\n` +
      `👥 Всего студентов: ${totalStudents}\n` +
      `✅ Присутствуют: ${presentCount + lateCount} (${percentage}%)\n` +
      `❌ Отсутствуют (н/б): ${absentCount > 0 ? absentList : 'нет'}\n` +
      `📝 По уважительной: ${excusedCount > 0 ? excusedList : 'нет'}\n` +
      `⏰ Опоздали: ${lateCount > 0 ? lateList : 'нет'}\n\n` +
      `Отчет сформирован через приложение "Староста 24" (@${currentUser.username.replace('@', '')})`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
      {/* Page Title Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800/90 rounded-3xl p-4 border border-slate-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/15 rounded-xl text-sky-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Журнал посещаемости</h2>
              <p className="text-[11px] text-slate-400">
                Электронная рапортичка старостата 24/7
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyReport}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm ${
              copiedReport
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Рапортичка</span>
              </>
            )}
          </button>
        </div>

        {/* Date & Pair Selector */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Дата
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Пара №</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((pairNum) => (
                <button
                  key={pairNum}
                  onClick={() => setSelectedPair(pairNum)}
                  className={`w-6 h-6 rounded-lg text-xs font-bold transition ${
                    selectedPair === pairNum
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pairNum}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Pair Details */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="truncate pr-2">
            <span className="text-slate-400">Предмет: </span>
            <span className="font-semibold text-white">{currentRecord.subject}</span>
          </div>
          <span className="text-[11px] text-sky-400 font-mono shrink-0">
            {selectedPair === 1
              ? '08:30 – 10:00'
              : selectedPair === 2
              ? '10:15 – 11:45'
              : selectedPair === 3
              ? '12:15 – 13:45'
              : '14:00 – 15:30'}
          </span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Явка</div>
          <div className="text-base font-extrabold text-emerald-400 mt-0.5">
            {percentage}%
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Были</div>
          <div className="text-base font-extrabold text-emerald-400 mt-0.5">
            {presentCount}
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Пропуски</div>
          <div className="text-base font-extrabold text-rose-400 mt-0.5">
            {absentCount}
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
          <div className="text-[11px] text-slate-400 font-medium">Справка</div>
          <div className="text-base font-extrabold text-amber-400 mt-0.5">
            {excusedCount}
          </div>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Subgroup buttons */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSubgroupFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              subgroupFilter === 'all'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Все ({users.filter((u) => u.role !== 'curator').length})
          </button>
          <button
            onClick={() => setSubgroupFilter(1)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              subgroupFilter === 1
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1 подгруппа
          </button>
          <button
            onClick={() => setSubgroupFilter(2)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              subgroupFilter === 2
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2 подгруппа
          </button>
        </div>

        {/* Fast Action: Mark All Present */}
        <button
          onClick={handleMarkAllPresent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-emerald-400 rounded-xl text-xs font-semibold transition active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Все здесь</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск студента по имени или юзернейму..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Student Attendance List */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
          Студенты ({filteredStudents.length}) — нажмите на аватар для открытия профиля:
        </div>

        {filteredStudents.map((student) => {
          const status = getStatus(student.id);

          return (
            <div
              key={student.id}
              className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition"
            >
              {/* Student info - clickable to open user profile! */}
              <button
                onClick={() => onOpenProfile(student)}
                className="flex items-center gap-3 min-w-0 text-left flex-1 group"
                title={`Открыть профиль ${student.name}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 group-hover:ring-sky-400 transition"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
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
                  <div className="font-semibold text-sm text-white group-hover:text-sky-300 transition truncate flex items-center gap-1.5">
                    <span>{student.name}</span>
                    {student.role === 'starosta' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-medium border border-amber-500/30">
                        Староста
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-sky-400/90 font-mono truncate">
                    {student.username}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {student.bio || `${student.subgroup}-я подгруппа`}
                  </div>
                </div>
              </button>

              {/* Attendance Status Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleSetStatus(student.id, 'present')}
                  title="Присутствует"
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition active:scale-95 ${
                    status === 'present'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-emerald-400'
                  }`}
                >
                  Б
                </button>
                <button
                  onClick={() => handleSetStatus(student.id, 'absent')}
                  title="Отсутствует (н/б)"
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition active:scale-95 ${
                    status === 'absent'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-rose-400'
                  }`}
                >
                  Н
                </button>
                <button
                  onClick={() => handleSetStatus(student.id, 'excused')}
                  title="Уважительная причина (справка)"
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition active:scale-95 ${
                    status === 'excused'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-amber-400'
                  }`}
                >
                  У
                </button>
                <button
                  onClick={() => handleSetStatus(student.id, 'late')}
                  title="Опоздал"
                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition active:scale-95 ${
                    status === 'late'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-indigo-400'
                  }`}
                >
                  О
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
