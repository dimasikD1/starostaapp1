/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { storage } from './services/storage';
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
} from './types/starosta';
import { rucScheduleService } from './services/rucScheduleService';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidNavBar, TabType } from './components/AndroidNavBar';
import { MainScreen } from './components/MainScreen';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { HomeworkTab } from './components/tabs/HomeworkTab';
import { AttendanceTab } from './components/tabs/AttendanceTab';
import { ChannelTab } from './components/tabs/ChannelTab';
import { GroupTab } from './components/tabs/GroupTab';
import { UserProfileSheet } from './components/UserProfileSheet';
import { ProfileEditModal } from './components/ProfileEditModal';
import { StarostaSignModal } from './components/StarostaSignModal';
import { TelegramBindingModal } from './components/TelegramBindingModal';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { DownloadApkModal } from './components/DownloadApkModal';
import { RucScheduleSyncModal } from './components/RucScheduleSyncModal';
import { usePWA } from './hooks/usePWA';
import { WifiOff, Smartphone, Monitor, CheckCircle, Bell, Download, SlidersHorizontal } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('main');

  // Interface scale slider (ползунок масштаба/размера)
  const [appScale, setAppScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('starosta_app_scale');
      return saved ? Number(saved) : 90;
    } catch {
      return 90;
    }
  });

  const handleScaleChange = (val: number) => {
    const clamped = Math.max(70, Math.min(115, val));
    setAppScale(clamped);
    try {
      localStorage.setItem('starosta_app_scale', String(clamped));
    } catch {
      // ignore
    }
  };

  // State
  const [users, setUsers] = useState<UserProfile[]>(() => storage.getUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => storage.getCurrentUserId());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => storage.getSchedule());
  const [homework, setHomework] = useState<HomeworkTask[]>(() => storage.getHomework());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => storage.getAnnouncements());
  const [polls, setPolls] = useState<Poll[]>(() => storage.getPolls());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => storage.getAttendance());
  const [groupMeta, setGroupMeta] = useState<GroupMeta>(() => storage.getGroupMeta());
  const [telegramBinding, setTelegramBinding] = useState<TelegramBinding>(() => storage.getTelegramBinding());
  const [starostaMandate, setStarostaMandate] = useState<StarostaMandate>(() => storage.getStarostaMandate());
  const [rucConfig, setRucConfig] = useState<RucScheduleConfig>(() => rucScheduleService.getConfig());

  // Interactive Modals
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isRucSyncOpen, setIsRucSyncOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isDownloadApkOpen, setIsDownloadApkOpen] = useState(false);

  // Simulated Telegram Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Android Phone Frame toggle
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // PWA
  const { isInstallable, isOnline, install } = usePWA();

  // Current User
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  // Storage sync effects
  useEffect(() => {
    storage.saveUsers(users);
  }, [users]);

  useEffect(() => {
    storage.saveCurrentUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    storage.saveSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    storage.saveHomework(homework);
  }, [homework]);

  useEffect(() => {
    storage.saveAnnouncements(announcements);
  }, [announcements]);

  useEffect(() => {
    storage.savePolls(polls);
  }, [polls]);

  useEffect(() => {
    storage.saveAttendance(attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    storage.saveTelegramBinding(telegramBinding);
  }, [telegramBinding]);

  useEffect(() => {
    storage.saveStarostaMandate(starostaMandate);
  }, [starostaMandate]);

  // Auto-sync with schedule.ruc.su on startup
  useEffect(() => {
    if (rucConfig.autoSync) {
      rucScheduleService
        .syncSchedule(rucConfig.portalUrl, rucConfig.groupCode)
        .then((res) => {
          if (res.success && res.items.length > 0) {
            setSchedule(res.items);
          }
        })
        .catch(() => {
          // quiet fallback to local storage
        });
    }
  }, []);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveRucConfig = (updated: RucScheduleConfig) => {
    setRucConfig(updated);
    rucScheduleService.saveConfig(updated);
  };

  const handleApplySchedule = (items: ScheduleItem[]) => {
    setSchedule(items);
    storage.saveSchedule(items);
  };

  // Handlers
  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (selectedProfileUser?.id === updatedUser.id) {
      setSelectedProfileUser(updatedUser);
    }
    showToast(`Профиль ${updatedUser.username} успешно обновлен!`);
  };

  const handleSignMandate = (updatedMandate: StarostaMandate, updatedUser: UserProfile) => {
    setStarostaMandate(updatedMandate);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setGroupMeta((prev) => ({ ...prev, starostaName: updatedUser.name }));
    showToast(`🎉 Полномочия старосты успешно подписаны: ${updatedUser.name}!`);
  };

  const handleSaveTelegram = (updated: TelegramBinding) => {
    setTelegramBinding(updated);
    showToast(`Привязка Telegram (@${updated.telegramUsername.replace('@', '')}) сохранена!`);
  };

  const handleSelectUser = (userId: string) => {
    setCurrentUserId(userId);
    const u = users.find((item) => item.id === userId);
    if (u) {
      showToast(`Вы вошли как: ${u.name} (${u.username})`);
    }
  };

  const handleUpdateAttendance = (rec: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === rec.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = rec;
        return copy;
      }
      return [...prev, rec];
    });
  };

  const handleToggleHomework = (taskId: string, userId: string) => {
    setHomework((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const exists = task.completedByUserIds.includes(userId);
        const updatedList = exists
          ? task.completedByUserIds.filter((id) => id !== userId)
          : [...task.completedByUserIds, userId];
        return { ...task, completedByUserIds: updatedList };
      })
    );
  };

  const handleVotePoll = (pollId: string, optionId: string, userId: string) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const updatedOptions = poll.options.map((opt) => {
          if (opt.id === optionId) {
            const hasVoted = opt.votedUserIds.includes(userId);
            const newList = hasVoted
              ? opt.votedUserIds.filter((id) => id !== userId)
              : [...opt.votedUserIds, userId];
            return { ...opt, votedUserIds: newList };
          }
          if (!poll.isMultiple) {
            return {
              ...opt,
              votedUserIds: opt.votedUserIds.filter((id) => id !== userId),
            };
          }
          return opt;
        });
        return { ...poll, options: updatedOptions };
      })
    );
  };

  const handleToggleReaction = (annId: string, emoji: string, userId: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id !== annId) return ann;
        const currentList = ann.reactions[emoji] || [];
        const hasVoted = currentList.includes(userId);
        const updatedList = hasVoted
          ? currentList.filter((id) => id !== userId)
          : [...currentList, userId];
        return {
          ...ann,
          reactions: {
            ...ann.reactions,
            [emoji]: updatedList,
          },
        };
      })
    );
  };

  const handleAddComment = (annId: string, text: string) => {
    const newComment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      text,
      timestamp: 'Только что',
    };
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id !== annId) return ann;
        return {
          ...ann,
          comments: [...ann.comments, newComment],
        };
      })
    );
  };

  const handleQuickMarkAttendance = (userId: string, status: AttendanceStatus) => {
    const todayStr = '2026-11-05';
    const pairNum = 1;
    const existing = attendanceRecords.find((r) => r.date === todayStr && r.pairNumber === pairNum);
    const updated: AttendanceRecord = existing
      ? {
          ...existing,
          records: { ...existing.records, [userId]: status },
          updatedAt: new Date().toISOString(),
        }
      : {
          id: `att-${todayStr}-${pairNum}`,
          date: todayStr,
          pairNumber: pairNum,
          subject: 'Базы данных и проектирование ИС',
          records: { [userId]: status },
          updatedAt: new Date().toISOString(),
        };

    handleUpdateAttendance(updated);
  };

  const starostaUser =
    users.find((u) => u.id === starostaMandate.starostaUserId) ||
    users.find((u) => u.role === 'starosta') ||
    currentUser;

  const todayClasses = schedule.filter((s) => s.dayOfWeek === 1);
  const currentPairRecord = attendanceRecords.find((r) => r.date === '2026-11-05' && r.pairNumber === 1) || {
    id: 'att-2026-11-05-1',
    date: '2026-11-05',
    pairNumber: 1,
    subject: todayClasses[0]?.subject || 'Базы данных и проектирование ИС',
    records: {},
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Banner on Desktop */}
      <aside aria-label="Панель переключения вида" className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 hidden md:flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-semibold text-slate-200">
            Староста 24 | Главный экран
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            Подписание полномочий старосты • Привязка Telegram-бота • Журнал и профили
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Interactive Scale Slider (Ползунок масштаба) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/90 rounded-lg border border-slate-700/80">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[11px] text-slate-300 font-medium">Ползунок:</span>
            <input
              type="range"
              min="70"
              max="115"
              step="5"
              value={appScale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-20 accent-sky-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              title="Регулировка размера интерфейса"
            />
            <span className="font-mono text-sky-400 font-bold text-[11px] min-w-[32px] text-right">{appScale}%</span>
          </div>

          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-semibold border border-slate-700 transition"
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Полный экран</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Вид смартфона</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsDownloadApkOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 rounded-lg text-xs font-bold border border-emerald-500/40 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Скачать APK</span>
          </button>
          <button
            onClick={() => setIsUserSwitcherOpen(true)}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold transition"
          >
            Сменить студента ({currentUser.name.split(' ')[0]})
          </button>
        </div>
      </aside>

      {/* Simulated Telegram Bot Toast */}
      {toastMessage && (
        <div className="fixed top-3 z-50 px-4 py-2.5 max-w-sm mx-auto bg-sky-900/90 text-white rounded-2xl border border-sky-400/50 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2 animate-slide-down">
          <Bell className="w-4 h-4 text-sky-300 shrink-0 animate-bounce" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Offline Alert */}
      {!isOnline && (
        <div className="w-full bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 z-50">
          <WifiOff className="w-4 h-4" />
          <span>Офлайн режим — данные сохраняются локально</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full flex-1 flex justify-center items-start sm:p-2 md:p-3 overflow-x-hidden">
        <div
          style={{
            maxWidth: isPhoneFrame ? `${Math.round(412 * (appScale / 100))}px` : `${Math.round(672 * (appScale / 100))}px`,
          }}
          className={`w-full transition-all duration-150 flex flex-col bg-slate-950 ${
            isPhoneFrame
              ? 'min-h-[90vh] sm:rounded-3xl sm:border border-slate-800 shadow-2xl relative overflow-hidden'
              : 'min-h-screen'
          }`}
        >
          {/* Android Speaker Grill on top of bezel */}
          {isPhoneFrame && (
            <div className="hidden sm:flex justify-center pt-2 pb-0.5 bg-slate-900 select-none">
              <div className="w-16 h-1 bg-slate-800 rounded-full" />
            </div>
          )}

          {/* Android Status Bar */}
          <AndroidStatusBar
            currentUser={currentUser}
            groupCode={groupMeta.code}
            onOpenProfile={(u) => setSelectedProfileUser(u)}
            onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
            isPhoneFrame={isPhoneFrame}
            onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
            onOpenDownloadApk={() => setIsDownloadApkOpen(true)}
            appScale={appScale}
            onScaleChange={handleScaleChange}
          />

          {/* Active Tab Screen Content with Smooth Transitions */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
            <AnimatePresence mode="wait">
              {currentTab === 'main' && (
                <motion.div
                  key="tab-main"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full"
                >
                  <MainScreen
                    currentUser={currentUser}
                    users={users}
                    groupMeta={groupMeta}
                    telegramBinding={telegramBinding}
                    starostaMandate={starostaMandate}
                    rucConfig={rucConfig}
                    schedule={schedule}
                    homework={homework}
                    announcements={announcements}
                    polls={polls}
                    attendanceRecords={attendanceRecords}
                    onOpenProfile={(u) => setSelectedProfileUser(u)}
                    onEditProfile={() => setIsEditingProfile(true)}
                    onOpenSignModal={() => setIsSignModalOpen(true)}
                    onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
                    onOpenRucSync={() => setIsRucSyncOpen(true)}
                    onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
                    onOpenAI={() => setIsAIOpen(true)}
                    onUpdateAttendance={handleUpdateAttendance}
                    onToggleHomework={handleToggleHomework}
                    onVotePoll={handleVotePoll}
                    onToggleReaction={handleToggleReaction}
                    onAddComment={handleAddComment}
                    onNavigateTab={(t) => setCurrentTab(t)}
                  />
                </motion.div>
              )}

              {currentTab === 'schedule' && (
                <motion.div
                  key="tab-schedule"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full"
                >
                  <ScheduleTab
                    schedule={schedule}
                    groupCode={groupMeta.code}
                    onAddScheduleItem={(item) => setSchedule((prev) => [...prev, item])}
                    onDeleteScheduleItem={(id) => setSchedule((prev) => prev.filter((s) => s.id !== id))}
                    onOpenRucSync={() => setIsRucSyncOpen(true)}
                  />
                </motion.div>
              )}

              {currentTab === 'homework' && (
                <motion.div
                  key="tab-homework"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full"
                >
                  <HomeworkTab
                    homework={homework}
                    currentUser={currentUser}
                    users={users}
                    onAddHomework={(task) => setHomework((prev) => [task, ...prev])}
                    onToggleComplete={handleToggleHomework}
                    onOpenProfile={(u) => setSelectedProfileUser(u)}
                  />
                </motion.div>
              )}

              {currentTab === 'attendance' && (
                <motion.div
                  key="tab-attendance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full"
                >
                  <AttendanceTab
                    users={users}
                    currentUser={currentUser}
                    attendanceRecords={attendanceRecords}
                    onUpdateAttendance={handleUpdateAttendance}
                    schedule={schedule}
                    onOpenProfile={(u) => setSelectedProfileUser(u)}
                    onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
                  />
                </motion.div>
              )}

              {currentTab === 'channel' && (
                <motion.div
                  key="tab-channel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full"
                >
                  <ChannelTab
                    announcements={announcements}
                    currentUser={currentUser}
                    users={users}
                    onAddAnnouncement={(ann) => setAnnouncements((prev) => [ann, ...prev])}
                    onAddComment={handleAddComment}
                    onToggleReaction={handleToggleReaction}
                    onOpenProfile={(u) => setSelectedProfileUser(u)}
                    onOpenAI={() => setIsAIOpen(true)}
                  />
                </motion.div>
              )}

              {currentTab === 'group' && (
                <motion.div
                  key="tab-group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full"
                >
                  <GroupTab
                    users={users}
                    currentUser={currentUser}
                    polls={polls}
                    groupMeta={groupMeta}
                    onOpenProfile={(u) => setSelectedProfileUser(u)}
                    onVotePoll={handleVotePoll}
                    onAddPoll={(poll) => setPolls((prev) => [poll, ...prev])}
                    onAddNewStudent={(student) => setUsers((prev) => [...prev, student])}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Android Bottom Navigation Bar */}
          <AndroidNavBar
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            unreadAnnouncementsCount={announcements.filter((a) => a.pinned).length}
            pendingHomeworkCount={homework.filter((t) => !t.completedByUserIds.includes(currentUser.id)).length}
          />
        </div>
      </main>

      {/* MODALS */}

      {/* 1. Student User Profile Sheet (Opens when clicking any student!) */}
      <UserProfileSheet
        user={selectedProfileUser}
        currentUser={currentUser}
        onClose={() => setSelectedProfileUser(null)}
        onEditProfile={(u) => {
          setSelectedProfileUser(null);
          setIsEditingProfile(true);
        }}
        onSwitchUser={(userId) => {
          handleSelectUser(userId);
          setSelectedProfileUser(null);
        }}
        onQuickMarkAttendance={handleQuickMarkAttendance}
      />

      {/* 2. Edit Profile Modal (username, profile photo, short bio) */}
      <ProfileEditModal
        user={currentUser}
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSave={handleSaveProfile}
      />

      {/* 3. Starosta Sign Mandate Modal («Староста мог сам себя подписать») */}
      <StarostaSignModal
        currentUser={currentUser}
        groupMeta={groupMeta}
        mandate={starostaMandate}
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSignMandate={handleSignMandate}
      />

      {/* 4. Telegram & Services Binding Modal («Привязка ТГ и т.п.») */}
      <TelegramBindingModal
        binding={telegramBinding}
        groupMeta={groupMeta}
        starostaUser={starostaUser}
        starostaMandate={starostaMandate}
        students={users.filter((u) => u.role !== 'curator')}
        todayClasses={todayClasses}
        currentPairRecord={currentPairRecord}
        homework={homework}
        poll={polls[0]}
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onSave={handleSaveTelegram}
        onSendTestNotification={showToast}
      />

      {/* 5. Switch User Modal */}
      <UserSwitcherModal
        users={users}
        currentUserId={currentUserId}
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
        onSelectUser={handleSelectUser}
        onAddNewUser={() => {
          setIsUserSwitcherOpen(false);
          setIsEditingProfile(true);
        }}
      />

      {/* 6. Gemini Starosta AI Assistant */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        groupCode={groupMeta.code}
        onPublishToChannel={(title, content) => {
          setAnnouncements((prev) => [
            {
              id: `ann-${Date.now()}`,
              authorId: currentUser.id,
              title,
              content,
              timestamp: 'Только что',
              pinned: true,
              category: 'important',
              reactions: { '👍': [currentUser.id] },
              comments: [],
            },
            ...prev,
          ]);
          showToast('Объявление опубликовано в канал группы!');
        }}
      />

      {/* 7. Download APK Modal */}
      <DownloadApkModal
        isOpen={isDownloadApkOpen}
        onClose={() => setIsDownloadApkOpen(false)}
        appUrl={window.location.origin}
        onInstallWebApk={install}
        isInstallable={isInstallable}
      />

      {/* 8. RUC Schedule Sync Modal (schedule.ruc.su) */}
      <RucScheduleSyncModal
        isOpen={isRucSyncOpen}
        onClose={() => setIsRucSyncOpen(false)}
        config={rucConfig}
        onSaveConfig={handleSaveRucConfig}
        onApplySchedule={handleApplySchedule}
        currentUser={currentUser}
        starosta1={users.find((u) => u.id === 'user-1') || users[0]}
        starosta2={users.find((u) => u.id === 'user-2') || users[1] || users[0]}
        onSelectUser={handleSelectUser}
        onToast={showToast}
      />
    </div>
  );
}
