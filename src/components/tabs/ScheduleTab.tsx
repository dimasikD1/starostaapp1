import React, { useState } from 'react';
import { ScheduleItem } from '../../types/starosta';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  BookOpen,
  CheckCircle,
  X,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface ScheduleTabProps {
  schedule: ScheduleItem[];
  groupCode?: string;
  onAddScheduleItem: (item: ScheduleItem) => void;
  onDeleteScheduleItem: (id: string) => void;
  onOpenRucSync?: () => void;
}

const DAYS = [
  { id: 1, name: 'Пн', full: 'Понедельник' },
  { id: 2, name: 'Вт', full: 'Вторник' },
  { id: 3, name: 'Ср', full: 'Среда' },
  { id: 4, name: 'Чт', full: 'Четверг' },
  { id: 5, name: 'Пт', full: 'Пятница' },
  { id: 6, name: 'Сб', full: 'Суббота' },
];

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  schedule,
  groupCode = 'БИ(ЭБ) 1/2',
  onAddScheduleItem,
  onDeleteScheduleItem,
  onOpenRucSync,
}) => {
  // Current day of week (1..6)
  const todayDay = new Date().getDay() === 0 ? 1 : new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(todayDay <= 6 ? todayDay : 1);
  const [weekTypeFilter, setWeekTypeFilter] = useState<'both' | 'numerator' | 'denominator'>('both');
  const [subgroupFilter, setSubgroupFilter] = useState<'all' | 1 | 2>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [auditorium, setAuditorium] = useState('');
  const [type, setType] = useState<'lecture' | 'practice' | 'lab'>('lecture');
  const [pairNumber, setPairNumber] = useState<number>(1);
  const [subgroup, setSubgroup] = useState<'all' | '1' | '2'>('all');

  const filteredSchedule = schedule
    .filter((item) => {
      if (item.dayOfWeek !== selectedDay) return false;
      if (weekTypeFilter !== 'both' && item.weekType !== 'both' && item.weekType !== weekTypeFilter) {
        return false;
      }
      if (subgroupFilter !== 'all' && item.subgroup && item.subgroup !== subgroupFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.pairNumber - b.pairNumber);

  const getPairTimes = (pairNum: number) => {
    switch (pairNum) {
      case 1:
        return { start: '08:30', end: '10:00' };
      case 2:
        return { start: '10:15', end: '11:45' };
      case 3:
        return { start: '12:15', end: '13:45' };
      case 4:
        return { start: '14:00', end: '15:30' };
      case 5:
        return { start: '15:45', end: '17:15' };
      default:
        return { start: '17:30', end: '19:00' };
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    const times = getPairTimes(pairNumber);
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      dayOfWeek: selectedDay,
      weekType: weekTypeFilter,
      pairNumber,
      timeStart: times.start,
      timeEnd: times.end,
      subject: subject.trim(),
      type,
      teacher: teacher.trim() || 'Преподаватель кафедры',
      auditorium: auditorium.trim() || 'Ауд. уточняется',
      subgroup: subgroup === 'all' ? null : (Number(subgroup) as 1 | 2),
    };

    onAddScheduleItem(newItem);
    setSubject('');
    setTeacher('');
    setAuditorium('');
    setShowAddModal(false);
  };

  const getTypeBadge = (classType: string) => {
    switch (classType) {
      case 'lecture':
        return { label: 'Лекция', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'lab':
        return { label: 'Лабораторная', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'Практика', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800/90 rounded-3xl p-4 border border-slate-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/15 rounded-xl text-sky-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Расписание занятий</h2>
              <p className="text-[11px] text-slate-400">
                Сетка пар и аудиторий на текущий семестр
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRucSync && (
              <button
                type="button"
                onClick={onOpenRucSync}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>schedule.ruc.su</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        {/* Subgroup Selector */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-2">
          <button
            type="button"
            onClick={() => setSubgroupFilter('all')}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
              subgroupFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Все (1 и 2 п/гр)
          </button>
          <button
            type="button"
            onClick={() => setSubgroupFilter(1)}
            className={`flex-1 py-1 text-xs font-bold transition rounded-lg ${
              subgroupFilter === 1 ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            1 п/гр (Дмитрий)
          </button>
          <button
            type="button"
            onClick={() => setSubgroupFilter(2)}
            className={`flex-1 py-1 text-xs font-bold transition rounded-lg ${
              subgroupFilter === 2 ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            2 п/гр (Анна)
          </button>
        </div>

        {/* Week Type Filter */}
        <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setWeekTypeFilter('both')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition ${
              weekTypeFilter === 'both' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Все недели
          </button>
          <button
            onClick={() => setWeekTypeFilter('numerator')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition ${
              weekTypeFilter === 'numerator' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Числитель (1)
          </button>
          <button
            onClick={() => setWeekTypeFilter('denominator')}
            className={`flex-1 py-1 text-xs font-semibold rounded-lg transition ${
              weekTypeFilter === 'denominator' ? 'bg-slate-800 text-sky-400 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Знаменатель (2)
          </button>
        </div>
      </div>

      {/* Days of Week Horizontal Scroll / Grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.id;
          const isToday = todayDay === day.id;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition ${
                isSelected
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold">{day.name}</span>
              {isToday && (
                <span
                  className={`text-[9px] mt-0.5 px-1 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'text-sky-400 font-semibold'
                  }`}
                >
                  Сегодня
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Banner */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
        <span>
          {DAYS.find((d) => d.id === selectedDay)?.full} • Пар: {filteredSchedule.length}
        </span>
        <span className="text-sky-400 text-[11px]">
          {weekTypeFilter === 'both' ? 'Обычная сетка' : weekTypeFilter === 'numerator' ? 'Числитель' : 'Знаменатель'}
        </span>
      </div>

      {/* Schedule Items List */}
      {filteredSchedule.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">В этот день занятий нет</div>
          <p className="text-xs text-slate-500">
            Можно отдохнуть или подготовить домашние задания и отчеты
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-semibold transition"
          >
            + Назначить пару на этот день
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedule.map((item) => {
            const typeBadge = getTypeBadge(item.type);

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition space-y-3 relative overflow-hidden"
              >
                {/* Header: Pair Number + Times + Type Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center">
                      {item.pairNumber}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      {item.timeStart} – {item.timeEnd}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${typeBadge.bg}`}
                    >
                      {typeBadge.label}
                    </span>
                    {item.subgroup && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-md font-medium">
                        {item.subgroup} п/гр
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Name */}
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {item.subject}
                </h3>

                {/* Teacher & Auditorium */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{item.teacher}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate justify-end text-sky-400 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{item.auditorium}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Pair Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Добавить пару в расписание</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Название предмета
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Архитектура ЭВМ"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Номер пары
                  </label>
                  <select
                    value={pairNumber}
                    onChange={(e) => setPairNumber(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value={1}>1 пара (08:30 - 10:00)</option>
                    <option value={2}>2 пара (10:15 - 11:45)</option>
                    <option value={3}>3 пара (12:15 - 13:45)</option>
                    <option value={4}>4 пара (14:00 - 15:30)</option>
                    <option value={5}>5 пара (15:45 - 17:15)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Тип занятия
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'lecture' | 'practice' | 'lab')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="lecture">Лекция</option>
                    <option value="practice">Практика</option>
                    <option value="lab">Лабораторная</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Преподаватель
                </label>
                <input
                  type="text"
                  placeholder="проф. Смирнов А.В."
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Аудитория
                  </label>
                  <input
                    type="text"
                    placeholder="Ауд. 412"
                    value={auditorium}
                    onChange={(e) => setAuditorium(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Подгруппа
                  </label>
                  <select
                    value={subgroup}
                    onChange={(e) => setSubgroup(e.target.value as 'all' | '1' | '2')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="all">Вся группа</option>
                    <option value="1">1-я подгруппа</option>
                    <option value="2">2-я подгруппа</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  Сохранить в расписание
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
