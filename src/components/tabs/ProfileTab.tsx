import React from 'react';
import { UserProfile, GroupMeta } from '../../types/starosta';
import {
  User,
  Edit3,
  Award,
  BookOpen,
  Calendar,
  Send,
  Phone,
  Mail,
  Shield,
  Smartphone,
  Users,
  RotateCcw,
  Download,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ProfileTabProps {
  currentUser: UserProfile;
  groupMeta: GroupMeta;
  onEditProfile: () => void;
  onOpenUserSwitcher: () => void;
  onResetData: () => void;
  onInstallPWA?: () => void;
  isPWAInstallable?: boolean;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  groupMeta,
  onEditProfile,
  onOpenUserSwitcher,
  onResetData,
  onInstallPWA,
  isPWAInstallable,
}) => {
  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
      {/* Profile Card Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/40 rounded-3xl p-5 border border-slate-700/60 shadow-xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-sky-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                {currentUser.name}
              </h2>
              <p className="text-sm font-semibold text-sky-400 font-mono mt-0.5">
                {currentUser.username}
              </p>

              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md">
                  {currentUser.roleTitle}
                </span>
                <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-medium">
                  {currentUser.subgroup}-я подгруппа
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onEditProfile}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 rounded-xl transition active:scale-95 shrink-0"
            title="Редактировать профиль"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Short Bio Callout - Explicitly requested in prompt */}
        <div className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>О себе (Краткое био)</span>
            <button
              onClick={onEditProfile}
              className="text-[10px] text-sky-400 hover:underline font-normal"
            >
              Изменить
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic whitespace-pre-wrap">
            {currentUser.bio ? `"${currentUser.bio}"` : 'Нажмите "Редактировать", чтобы добавить краткое био о себе!'}
          </p>
          {currentUser.statusText && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="text-sky-400 font-semibold">Статус:</span>
              <span className="text-slate-300">{currentUser.statusText}</span>
            </div>
          )}
        </div>

        {/* Buttons: Edit Profile & Switch User */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onEditProfile}
            className="py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Редактировать профиль</span>
          </button>
          <button
            onClick={onOpenUserSwitcher}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Сменить пользователя</span>
          </button>
        </div>
      </div>

      {/* Academic Stats */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Учебная статистика
          </span>
          <span className="text-xs font-bold text-emerald-400">
            {currentUser.attendanceRate}% явка
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${currentUser.attendanceRate}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[11px] text-slate-400">Посещено пар</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              {currentUser.attendedClasses}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[11px] text-slate-400">Пропущено пар</div>
            <div className="text-base font-bold text-rose-400 mt-0.5">
              {currentUser.missedClasses}
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[11px] text-slate-400">Сдано заданий</div>
            <div className="text-base font-bold text-sky-400 mt-0.5">
              {currentUser.homeworkCompleted}
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {currentUser.badges && currentUser.badges.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Знаки отличия и роли</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.badges.map((b, i) => (
              <span
                key={i}
                className="text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700/80 px-3 py-1 rounded-xl"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contacts & Links */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">
          Контакты для связи
        </span>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-300">
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram:</span>
            </div>
            <span className="font-mono text-sky-400 font-semibold">{currentUser.username}</span>
          </div>

          {currentUser.phone && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Телефон:</span>
              </div>
              <span className="font-mono text-slate-200">{currentUser.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Group Information */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-2 text-xs">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">
          О группе и вузе
        </span>
        <div className="space-y-1.5 text-slate-300">
          <div>
            <span className="text-slate-500">Группа: </span>
            <span className="font-bold text-white">{groupMeta.code}</span> (Курс {groupMeta.course})
          </div>
          <div>
            <span className="text-slate-500">Факультет: </span>
            <span>{groupMeta.faculty}</span>
          </div>
          <div>
            <span className="text-slate-500">Университет: </span>
            <span>{groupMeta.university}</span>
          </div>
          <div>
            <span className="text-slate-500">Куратор: </span>
            <span className="text-sky-400 font-medium">{groupMeta.curatorName}</span>
          </div>
        </div>
      </div>

      {/* Android PWA Install Section */}
      <div className="bg-gradient-to-r from-sky-950/50 via-slate-900 to-indigo-950/50 border border-sky-800/40 rounded-3xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-2xl shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Установить как Android-приложение</h4>
            <p className="text-[11px] text-slate-400">
              Работает офлайн, доступ с главного экрана смартфона
            </p>
          </div>
        </div>

        {onInstallPWA && (
          <button
            onClick={onInstallPWA}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Установить</span>
          </button>
        )}
      </div>

      {/* Reset Data Button */}
      <div className="pt-2 text-center">
        <button
          onClick={onResetData}
          className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center justify-center gap-1.5 mx-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Сбросить данные к исходным</span>
        </button>
      </div>
    </div>
  );
};
