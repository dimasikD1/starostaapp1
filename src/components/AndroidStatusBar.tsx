import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, Sparkles, Smartphone, Download } from 'lucide-react';
import { UserProfile } from '../types/starosta';

interface AndroidStatusBarProps {
  currentUser: UserProfile;
  groupCode: string;
  onOpenProfile: (user: UserProfile) => void;
  onOpenUserSwitcher: () => void;
  onOpenAI: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenDownloadApk?: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  currentUser,
  groupCode,
  onOpenProfile,
  onOpenUserSwitcher,
  onOpenAI,
  isPhoneFrame,
  onTogglePhoneFrame,
  onOpenDownloadApk,
}) => {
  const [time, setTime] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 transition-all select-none">
      {/* Top Android System Status Bar */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 font-semibold tracking-wide">
          <span>{time}</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-sky-400 bg-sky-950/80 px-1 rounded border border-sky-800/40">
            24Староста
          </span>
        </div>

        {/* Center notch / hole punch simulator when in phone frame */}
        {isPhoneFrame && (
          <div className="hidden sm:flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-black rounded-full ring-1 ring-slate-800" />
          </div>
        )}

        {/* System Icons */}
        <div className="flex items-center gap-2 text-slate-300">
          <button
            onClick={onTogglePhoneFrame}
            title={isPhoneFrame ? 'Переключить в полный экран' : 'Включить рамку Android-смартфона'}
            className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 hover:text-sky-400 transition mr-2 bg-slate-800 px-2 py-0.5 rounded-md"
          >
            <Smartphone className="w-3 h-3" />
            <span>{isPhoneFrame ? 'Рамка вкл' : 'Полный'}</span>
          </button>
          <Signal className="w-3.5 h-3.5 text-slate-400" />
          <Wifi className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-400">98%</span>
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* App Header Bar with Starosta Group Branding & Current User */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold text-sm tracking-tight shrink-0">
            24
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight leading-tight">
                Староста 24
              </h1>
              <span className="text-[11px] font-semibold text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/40">
                {groupCode}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Синхронизировано • Бот онлайн</span>
            </div>
          </div>
        </div>

        {/* Right Action buttons: Download APK + AI assistant + Profile Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Download APK button */}
          {onOpenDownloadApk && (
            <button
              onClick={onOpenDownloadApk}
              className="flex items-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition active:scale-95"
              title="Скачать APK / Установить"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK</span>
            </button>
          )}

          {/* AI Helper button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 py-1.5 px-2 rounded-xl bg-gradient-to-r from-indigo-900/80 to-purple-900/80 border border-indigo-700/50 text-indigo-200 hover:text-white hover:border-indigo-500 text-xs font-semibold shadow-sm transition active:scale-95"
            title="ИИ-помощник старосты"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">ИИ</span>
          </button>

          {/* Current User Quick Button with Avatar & Role */}
          <button
            onClick={() => onOpenProfile(currentUser)}
            className="flex items-center gap-2 p-1 pl-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 rounded-2xl transition active:scale-95"
            title="Открыть мой профиль"
          >
            <div className="text-right hidden xs:block">
              <div className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-sky-400 font-mono leading-none truncate max-w-[90px]">
                {currentUser.username}
              </div>
            </div>
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-sky-500"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
