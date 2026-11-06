import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Calendar,
  CheckSquare,
  ClipboardCheck,
  MessageCircle,
  Users,
} from 'lucide-react';

export type TabType = 'main' | 'schedule' | 'homework' | 'attendance' | 'channel' | 'group';

interface AndroidNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadAnnouncementsCount?: number;
  pendingHomeworkCount?: number;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onTabChange,
  unreadAnnouncementsCount = 0,
  pendingHomeworkCount = 0,
}) => {
  const tabs = [
    {
      id: 'main' as TabType,
      label: 'Главная',
      icon: Home,
    },
    {
      id: 'schedule' as TabType,
      label: 'Расписание',
      icon: Calendar,
    },
    {
      id: 'homework' as TabType,
      label: 'Задания',
      icon: CheckSquare,
      badge: pendingHomeworkCount > 0 ? pendingHomeworkCount : undefined,
    },
    {
      id: 'attendance' as TabType,
      label: 'Журнал',
      icon: ClipboardCheck,
    },
    {
      id: 'channel' as TabType,
      label: 'Канал',
      icon: MessageCircle,
      badge: unreadAnnouncementsCount > 0 ? unreadAnnouncementsCount : undefined,
    },
    {
      id: 'group' as TabType,
      label: 'Группа',
      icon: Users,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 select-none pb-safe">
      <div className="grid grid-cols-6 max-w-lg mx-auto py-1.5 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center py-1 px-1 transition-all group relative active:scale-95"
            >
              <div className="relative px-3 py-1 rounded-2xl flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="navBarSlider"
                    className="absolute inset-0 bg-sky-500/20 border border-sky-500/40 rounded-2xl -z-10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-sky-400 stroke-[2.5] scale-110' : 'text-slate-400 group-hover:text-slate-200 stroke-2'
                  }`}
                />

                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 truncate max-w-full ${
                  isActive ? 'font-bold text-sky-400' : 'text-slate-400 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android bottom gesture bar */}
      <div className="flex justify-center pb-1">
        <div className="w-32 h-1 bg-slate-700/60 rounded-full" />
      </div>
    </nav>
  );
};
