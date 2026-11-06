import React from 'react';
import { UserProfile, AttendanceStatus } from '../types/starosta';
import {
  X,
  Send,
  Phone,
  Mail,
  Shield,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit3,
  UserCheck,
  ArrowLeftRight,
} from 'lucide-react';

interface UserProfileSheetProps {
  user: UserProfile | null;
  currentUser: UserProfile;
  onClose: () => void;
  onEditProfile: (user: UserProfile) => void;
  onSwitchUser: (userId: string) => void;
  onQuickMarkAttendance?: (userId: string, status: AttendanceStatus) => void;
  currentAttendanceStatus?: AttendanceStatus;
}

export const UserProfileSheet: React.FC<UserProfileSheetProps> = ({
  user,
  currentUser,
  onClose,
  onEditProfile,
  onSwitchUser,
  onQuickMarkAttendance,
  currentAttendanceStatus,
}) => {
  if (!user) return null;

  const isMe = user.id === currentUser.id;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'starosta':
        return { label: 'Староста группы', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'deputy':
        return { label: 'Заместитель старосты', bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'proforg':
        return { label: 'Профорг', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'curator':
        return { label: 'Куратор / Преподаватель', bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'Студент', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
  };

  const roleInfo = getRoleBadge(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android drag handle indicator */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header with cover glow & close button */}
        <div className="relative pt-4 px-5 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Профиль в Староста 24
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-200">
          {/* Main User Card */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-sky-500/30 shadow-lg"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  user.status === 'online'
                    ? 'bg-emerald-500'
                    : user.status === 'in_class'
                    ? 'bg-amber-500'
                    : 'bg-slate-500'
                }`}
                title={user.statusText || user.status}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white tracking-tight leading-snug truncate">
                  {user.name}
                </h3>
              </div>
              <p className="text-sm font-medium text-sky-400 tracking-wide mt-0.5">
                {user.username}
              </p>

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${roleInfo.bg}`}
                >
                  {roleInfo.label}
                </span>
                <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/60">
                  {user.subgroup}-я подгруппа
                </span>
              </div>
            </div>
          </div>

          {/* Short Bio section - highlight per user prompt */}
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <span>О себе (Био)</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed italic whitespace-pre-wrap">
              {user.bio ? `"${user.bio}"` : 'Пользователь еще не указал информацию о себе.'}
            </p>
            {user.statusText && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center gap-2 text-xs text-slate-400">
                <span className="text-sky-400">● Статус:</span>
                <span className="text-slate-300 font-medium">{user.statusText}</span>
              </div>
            )}
          </div>

          {/* Academic & Attendance Stats */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Статистика в группе</span>
              <span className="text-sky-400 font-bold">{user.attendanceRate}% посещаемость</span>
            </div>

            {/* Attendance Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  user.attendanceRate >= 90
                    ? 'bg-emerald-500'
                    : user.attendanceRate >= 75
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${user.attendanceRate}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5">
                <div className="text-xs text-slate-400">Посетил</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">
                  {user.attendedClasses} пар
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5">
                <div className="text-xs text-slate-400">Пропуски</div>
                <div className="text-base font-bold text-rose-400 mt-0.5">
                  {user.missedClasses} пар
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-2.5">
                <div className="text-xs text-slate-400">Сдал ДЗ</div>
                <div className="text-base font-bold text-sky-400 mt-0.5">
                  {user.homeworkCompleted} работ
                </div>
              </div>
            </div>
          </div>

          {/* Badges / Достижения */}
          {user.badges && user.badges.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Знаки отличия</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700/70 px-2.5 py-1 rounded-lg"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Contact buttons */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Связь со студентом
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={user.telegram ? `https://t.me/${user.telegram.replace('@', '')}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Написать в TG</span>
              </a>
              {user.phone ? (
                <a
                  href={`tel:${user.phone}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition active:scale-[0.98]"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Позвонить</span>
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/40 text-slate-500 border border-slate-800 rounded-xl text-xs font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Нет телефона</span>
                </div>
              )}
            </div>
          </div>

          {/* Roll-call Quick Action (For Starosta / Deputy to mark attendance directly from profile) */}
          {onQuickMarkAttendance && (
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                  Быстрая отметка на текущей паре
                </span>
                {currentAttendanceStatus && (
                  <span className="text-[11px] text-sky-400 font-medium">
                    Сейчас: {currentAttendanceStatus === 'present' ? 'Был' : currentAttendanceStatus === 'absent' ? 'Н' : currentAttendanceStatus === 'excused' ? 'Ув' : 'Опоздал'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  onClick={() => onQuickMarkAttendance(user.id, 'present')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                    currentAttendanceStatus === 'present'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Был</span>
                </button>
                <button
                  onClick={() => onQuickMarkAttendance(user.id, 'absent')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                    currentAttendanceStatus === 'absent'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Н</span>
                </button>
                <button
                  onClick={() => onQuickMarkAttendance(user.id, 'excused')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                    currentAttendanceStatus === 'excused'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ув.</span>
                </button>
                <button
                  onClick={() => onQuickMarkAttendance(user.id, 'late')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                    currentAttendanceStatus === 'late'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Опоздал</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
          {isMe ? (
            <button
              onClick={() => {
                onClose();
                onEditProfile(user);
              }}
              className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98]"
            >
              <Edit3 className="w-4 h-4" />
              <span>Редактировать мой профиль</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onSwitchUser(user.id);
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Войти от лица {user.name.split(' ')[0]}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
