export type UserRole = 'starosta' | 'deputy' | 'proforg' | 'student' | 'curator';

export interface UserProfile {
  id: string;
  name: string;
  username: string; // e.g. @dima_starosta
  avatar: string; // image URL or data URI
  bio: string; // Short bio
  role: UserRole;
  roleTitle: string; // "Староста", "Зам. старосты", etc.
  subgroup: 1 | 2;
  phone?: string;
  telegram?: string;
  email?: string;
  attendanceRate: number; // percentage, e.g. 95
  attendedClasses: number;
  missedClasses: number;
  homeworkCompleted: number;
  badges: string[];
  status: 'online' | 'in_class' | 'study' | 'offline';
  statusText?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  pairNumber: number;
  subject: string;
  teacher?: string;
  records: Record<string, AttendanceStatus>; // userId -> status
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 1 = Monday, ..., 6 = Saturday
  weekType: 'both' | 'numerator' | 'denominator'; // Все недели / Числитель / Знаменатель
  pairNumber: number;
  timeStart: string;
  timeEnd: string;
  subject: string;
  type: 'lecture' | 'practice' | 'lab';
  teacher: string;
  auditorium: string;
  subgroup?: 1 | 2 | null;
}

export interface HomeworkTask {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  priority: 'normal' | 'important' | 'exam';
  authorId: string;
  completedByUserIds: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  content: string;
  timestamp: string;
  pinned: boolean;
  category: 'important' | 'dean' | 'homework' | 'event' | 'poll';
  reactions: Record<string, string[]>; // emoji -> array of userIds
  comments: Comment[];
}

export interface PollOption {
  id: string;
  text: string;
  votedUserIds: string[];
}

export interface Poll {
  id: string;
  authorId: string;
  question: string;
  options: PollOption[];
  isMultiple: boolean;
  isClosed: boolean;
  createdAt: string;
}

export interface GroupMeta {
  code: string; // e.g. "БИ(ЭБ) 1/2"
  faculty: string; // e.g. "Факультет управления и права"
  course: number;
  university: string; // "Краснодарский кооперативный институт (филиал) РУК"
  curatorName: string;
  starostaName: string;
  secondStarostaName?: string;
  year?: number;
  region?: string;
}

export interface TelegramBinding {
  isBound: boolean;
  botToken: string; // Token from @BotFather
  botUsername: string; // e.g. "@Starosta24_bot"
  botFirstName?: string; // e.g. "Староста 24"
  botId?: string;
  chatId: string; // Personal or group chat ID
  telegramUsername: string; // e.g. "@dima_starosta"
  notificationsEnabled: boolean;
  vkChatUrl: string;
  universityPortalUrl: string;
  autoSendJournal: boolean;
}

export interface StarostaMandate {
  isSigned: boolean;
  starostaUserId: string;
  signedAt: string;
  signatureText: string;
  orderNumber: string;
  term: string;
}

export interface RucScheduleConfig {
  portalUrl: string; // "https://schedule.ruc.su/?ysclid=mw43l57l8d43423857"
  branchName: string; // "Краснодарский кооперативный институт (филиал) РУК"
  region: string; // "Краснодарский край"
  year: number; // 2026
  groupCode: string; // "БИ(ЭБ) 1/2"
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus: 'synced' | 'pending' | 'error';
  activeSubgroupFilter: 'all' | 1 | 2;
  starosta1UserId: string; // ID старосты 1-й подгруппы
  starosta2UserId: string; // ID старосты 2-й подгруппы
}

