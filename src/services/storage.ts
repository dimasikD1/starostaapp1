import {
  UserProfile,
  ScheduleItem,
  HomeworkTask,
  Announcement,
  Poll,
  GroupMeta,
  AttendanceRecord,
  TelegramBinding,
  StarostaMandate,
} from '../types/starosta';
import {
  INITIAL_USERS,
  INITIAL_SCHEDULE,
  INITIAL_HOMEWORK,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_POLLS,
  INITIAL_GROUP_META,
  INITIAL_ATTENDANCE,
  INITIAL_TELEGRAM_BINDING,
  INITIAL_STAROSTA_MANDATE,
} from '../data/mockData';

const KEYS = {
  USERS: 'starosta_users_v1',
  CURRENT_USER_ID: 'starosta_current_user_id_v1',
  SCHEDULE: 'starosta_schedule_v1',
  HOMEWORK: 'starosta_homework_v1',
  ANNOUNCEMENTS: 'starosta_announcements_v1',
  POLLS: 'starosta_polls_v1',
  GROUP_META: 'starosta_group_meta_v1',
  ATTENDANCE: 'starosta_attendance_v1',
  WEEK_TYPE: 'starosta_week_type_v1',
  TELEGRAM_BINDING: 'starosta_telegram_binding_v1',
  STAROSTA_MANDATE: 'starosta_mandate_v1',
};

export const storage = {
  getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: UserProfile[]) {
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getCurrentUserId(): string {
    try {
      const id = localStorage.getItem(KEYS.CURRENT_USER_ID);
      return id || 'user-1';
    } catch {
      return 'user-1';
    }
  },

  saveCurrentUserId(id: string) {
    try {
      localStorage.setItem(KEYS.CURRENT_USER_ID, id);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getSchedule(): ScheduleItem[] {
    try {
      const data = localStorage.getItem(KEYS.SCHEDULE);
      return data ? JSON.parse(data) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  },

  saveSchedule(schedule: ScheduleItem[]) {
    try {
      localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getHomework(): HomeworkTask[] {
    try {
      const data = localStorage.getItem(KEYS.HOMEWORK);
      return data ? JSON.parse(data) : INITIAL_HOMEWORK;
    } catch {
      return INITIAL_HOMEWORK;
    }
  },

  saveHomework(homework: HomeworkTask[]) {
    try {
      localStorage.setItem(KEYS.HOMEWORK, JSON.stringify(homework));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getAnnouncements(): Announcement[] {
    try {
      const data = localStorage.getItem(KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  },

  saveAnnouncements(announcements: Announcement[]) {
    try {
      localStorage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getPolls(): Poll[] {
    try {
      const data = localStorage.getItem(KEYS.POLLS);
      return data ? JSON.parse(data) : INITIAL_POLLS;
    } catch {
      return INITIAL_POLLS;
    }
  },

  savePolls(polls: Poll[]) {
    try {
      localStorage.setItem(KEYS.POLLS, JSON.stringify(polls));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getGroupMeta(): GroupMeta {
    try {
      const data = localStorage.getItem(KEYS.GROUP_META);
      return data ? JSON.parse(data) : INITIAL_GROUP_META;
    } catch {
      return INITIAL_GROUP_META;
    }
  },

  saveGroupMeta(meta: GroupMeta) {
    try {
      localStorage.setItem(KEYS.GROUP_META, JSON.stringify(meta));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : [INITIAL_ATTENDANCE];
    } catch {
      return [INITIAL_ATTENDANCE];
    }
  },

  saveAttendance(records: AttendanceRecord[]) {
    try {
      localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getTelegramBinding(): TelegramBinding {
    try {
      const data = localStorage.getItem(KEYS.TELEGRAM_BINDING);
      return data ? JSON.parse(data) : INITIAL_TELEGRAM_BINDING;
    } catch {
      return INITIAL_TELEGRAM_BINDING;
    }
  },

  saveTelegramBinding(binding: TelegramBinding) {
    try {
      localStorage.setItem(KEYS.TELEGRAM_BINDING, JSON.stringify(binding));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  getStarostaMandate(): StarostaMandate {
    try {
      const data = localStorage.getItem(KEYS.STAROSTA_MANDATE);
      return data ? JSON.parse(data) : INITIAL_STAROSTA_MANDATE;
    } catch {
      return INITIAL_STAROSTA_MANDATE;
    }
  },

  saveStarostaMandate(mandate: StarostaMandate) {
    try {
      localStorage.setItem(KEYS.STAROSTA_MANDATE, JSON.stringify(mandate));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  resetToDefault() {
    localStorage.clear();
  },
};
