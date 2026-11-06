import React, { useState } from 'react';
import { UserProfile, Poll, GroupMeta } from '../../types/starosta';
import {
  Users,
  Search,
  Plus,
  Vote,
  Phone,
  Send,
  Award,
  Shield,
  CheckCircle2,
  X,
  FileText,
  UserPlus,
} from 'lucide-react';

interface GroupTabProps {
  users: UserProfile[];
  currentUser: UserProfile;
  polls: Poll[];
  groupMeta: GroupMeta;
  onOpenProfile: (user: UserProfile) => void;
  onVotePoll: (pollId: string, optionId: string, userId: string) => void;
  onAddPoll: (poll: Poll) => void;
  onAddNewStudent: (student: UserProfile) => void;
}

export const GroupTab: React.FC<GroupTabProps> = ({
  users,
  currentUser,
  polls,
  groupMeta,
  onOpenProfile,
  onVotePoll,
  onAddPoll,
  onAddNewStudent,
}) => {
  const [activeSection, setActiveSection] = useState<'roster' | 'polls'>('roster');
  const [subgroupFilter, setSubgroupFilter] = useState<'all' | '1' | '2' | 'activ'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddPollModal, setShowAddPollModal] = useState(false);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentBio, setNewStudentBio] = useState('');
  const [newStudentSubgroup, setNewStudentSubgroup] = useState<1 | 2>(1);
  const [newStudentRole, setNewStudentRole] = useState<'student' | 'deputy' | 'proforg'>('student');

  // New Poll Form State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOption1, setPollOption1] = useState('');
  const [pollOption2, setPollOption2] = useState('');
  const [pollOption3, setPollOption3] = useState('');

  // Filter students
  const filteredUsers = users.filter((u) => {
    if (subgroupFilter === '1' && u.subgroup !== 1) return false;
    if (subgroupFilter === '2' && u.subgroup !== 2) return false;
    if (subgroupFilter === 'activ' && u.role === 'student') return false;

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

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    let uname = newStudentUsername.trim();
    if (uname && !uname.startsWith('@')) {
      uname = `@${uname}`;
    }

    const newStudent: UserProfile = {
      id: `user-${Date.now()}`,
      name: newStudentName.trim(),
      username: uname || `@student_${Math.floor(Math.random() * 900 + 100)}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
      bio: newStudentBio.trim() || 'Студент группы ' + groupMeta.code,
      role: newStudentRole,
      roleTitle: newStudentRole === 'deputy' ? 'Зам. старосты' : newStudentRole === 'proforg' ? 'Профорг' : 'Студент',
      subgroup: newStudentSubgroup,
      attendanceRate: 100,
      attendedClasses: 0,
      missedClasses: 0,
      homeworkCompleted: 0,
      badges: ['🎓 Студент'],
      status: 'online',
      statusText: 'Новый студент в группе',
    };

    onAddNewStudent(newStudent);
    setNewStudentName('');
    setNewStudentUsername('');
    setNewStudentBio('');
    setShowAddStudentModal(false);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !pollOption1.trim() || !pollOption2.trim()) return;

    const options = [
      { id: `opt-${Date.now()}-1`, text: pollOption1.trim(), votedUserIds: [] },
      { id: `opt-${Date.now()}-2`, text: pollOption2.trim(), votedUserIds: [] },
    ];
    if (pollOption3.trim()) {
      options.push({ id: `opt-${Date.now()}-3`, text: pollOption3.trim(), votedUserIds: [] });
    }

    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      authorId: currentUser.id,
      question: pollQuestion.trim(),
      options,
      isMultiple: false,
      isClosed: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddPoll(newPoll);
    setPollQuestion('');
    setPollOption1('');
    setPollOption2('');
    setPollOption3('');
    setShowAddPollModal(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800/90 rounded-3xl p-4 border border-slate-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/15 rounded-xl text-sky-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Старостат и состав группы</h2>
              <p className="text-[11px] text-slate-400">
                {groupMeta.code} • {groupMeta.faculty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {activeSection === 'roster' ? (
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Добавить</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddPollModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Опрос</span>
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs: Roster vs Polls */}
        <div className="flex bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSection('roster')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeSection === 'roster'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Списки студентов ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('polls')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeSection === 'polls'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Опросы группы ({polls.length})</span>
          </button>
        </div>
      </div>

      {activeSection === 'roster' ? (
        <div className="space-y-3">
          {/* Subgroup Filters */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setSubgroupFilter('all')}
              className={`flex-1 min-w-[70px] py-1 text-xs font-semibold rounded-lg transition ${
                subgroupFilter === 'all'
                  ? 'bg-slate-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Все ({users.length})
            </button>
            <button
              onClick={() => setSubgroupFilter('1')}
              className={`flex-1 min-w-[80px] py-1 text-xs font-semibold rounded-lg transition ${
                subgroupFilter === '1'
                  ? 'bg-slate-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1 подгруппа
            </button>
            <button
              onClick={() => setSubgroupFilter('2')}
              className={`flex-1 min-w-[80px] py-1 text-xs font-semibold rounded-lg transition ${
                subgroupFilter === '2'
                  ? 'bg-slate-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2 подгруппа
            </button>
            <button
              onClick={() => setSubgroupFilter('activ')}
              className={`flex-1 min-w-[75px] py-1 text-xs font-semibold rounded-lg transition ${
                subgroupFilter === 'activ'
                  ? 'bg-slate-800 text-sky-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Актив
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск по имени, юзернейму или био..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Student Cards List - Every single student has a rich profile! */}
          <div className="space-y-2.5">
            {filteredUsers.map((student) => {
              const isCurrentUser = student.id === currentUser.id;

              return (
                <div
                  key={student.id}
                  className={`bg-slate-900/90 border rounded-2xl p-3.5 shadow-sm transition hover:border-slate-700 ${
                    isCurrentUser ? 'border-sky-500/40 bg-sky-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <button
                      onClick={() => onOpenProfile(student)}
                      className="relative shrink-0 group"
                      title="Открыть профиль"
                    >
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-700 group-hover:ring-sky-400 transition"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                          student.status === 'online'
                            ? 'bg-emerald-500'
                            : student.status === 'in_class'
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                        }`}
                      />
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <button
                          onClick={() => onOpenProfile(student)}
                          className="font-bold text-sm text-white hover:text-sky-300 transition text-left truncate flex items-center gap-1.5"
                        >
                          <span className="truncate">{student.name}</span>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-semibold">
                              (Вы)
                            </span>
                          )}
                        </button>

                        <span className="text-[11px] font-bold text-emerald-400">
                          {student.attendanceRate}% явка
                        </span>
                      </div>

                      <div className="text-xs text-sky-400 font-mono mt-0.5">
                        {student.username}
                      </div>

                      {/* Role & Subgroup */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-md">
                          {student.roleTitle}
                        </span>
                        <span className="text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded-md">
                          {student.subgroup} п/гр
                        </span>
                        {student.statusText && (
                          <span className="text-[10px] text-slate-400 italic truncate max-w-[140px]">
                            • {student.statusText}
                          </span>
                        )}
                      </div>

                      {/* Short Bio preview */}
                      {student.bio && (
                        <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-2 leading-relaxed bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/50 italic">
                          "{student.bio}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenProfile(student)}
                      className="text-sky-400 hover:text-sky-300 font-semibold text-xs transition flex items-center gap-1"
                    >
                      <span>Посмотреть полный профиль</span>
                      <span aria-hidden="true">→</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {student.telegram && (
                        <a
                          href={`https://t.me/${student.telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="Написать в TG"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {student.phone && (
                        <a
                          href={`tel:${student.phone}`}
                          className="p-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="Позвонить"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Polls Section */
        <div className="space-y-4">
          {polls.map((poll) => {
            const author = users.find((u) => u.id === poll.authorId);
            const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votedUserIds.length, 0);

            return (
              <div
                key={poll.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3"
              >
                {/* Poll Author */}
                <div className="flex items-center justify-between">
                  {author && (
                    <button
                      onClick={() => onOpenProfile(author)}
                      className="flex items-center gap-2 group text-left"
                    >
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-sky-400"
                      />
                      <span className="text-xs text-slate-400 group-hover:text-sky-300 transition">
                        Опрос от <span className="font-semibold text-white">{author.name}</span>
                      </span>
                    </button>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono">
                    Всего голосов: {totalVotes}
                  </span>
                </div>

                {/* Question */}
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {poll.question}
                </h3>

                {/* Options */}
                <div className="space-y-2">
                  {poll.options.map((option) => {
                    const isMyVote = option.votedUserIds.includes(currentUser.id);
                    const voteCount = option.votedUserIds.length;
                    const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const voterUsers = users.filter((u) => option.votedUserIds.includes(u.id));

                    return (
                      <div key={option.id} className="space-y-1">
                        <button
                          onClick={() => onVotePoll(poll.id, option.id, currentUser.id)}
                          className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition relative overflow-hidden flex items-center justify-between gap-3 ${
                            isMyVote
                              ? 'border-sky-500 bg-sky-950/40 text-white font-bold'
                              : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {/* Percentage Fill Bar */}
                          <div
                            className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                              isMyVote ? 'bg-sky-500/20' : 'bg-slate-800/40'
                            }`}
                            style={{ width: `${percent}%` }}
                          />

                          <div className="relative z-10 flex items-center gap-2 truncate">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isMyVote ? 'border-sky-400 bg-sky-500 text-white' : 'border-slate-600'
                              }`}
                            >
                              {isMyVote && <CheckCircle2 className="w-3 h-3" />}
                            </span>
                            <span className="truncate">{option.text}</span>
                          </div>

                          <span className="relative z-10 font-mono text-[11px] shrink-0 text-slate-400">
                            {voteCount} ({percent}%)
                          </span>
                        </button>

                        {/* Avatars of students who voted for this option (user profiles interaction!) */}
                        {voterUsers.length > 0 && (
                          <div className="flex items-center gap-1 pl-2 pt-0.5">
                            <span className="text-[10px] text-slate-500">Голоса:</span>
                            <div className="flex items-center -space-x-1">
                              {voterUsers.slice(0, 4).map((voter) => (
                                <button
                                  key={voter.id}
                                  onClick={() => onOpenProfile(voter)}
                                  title={`${voter.name} (${voter.username})`}
                                  className="transition hover:scale-110"
                                >
                                  <img
                                    src={voter.avatar}
                                    alt={voter.name}
                                    className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-900"
                                  />
                                </button>
                              ))}
                              {voterUsers.length > 4 && (
                                <span className="text-[9px] text-slate-500 pl-1 font-mono">
                                  +{voterUsers.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Добавить студента в группу</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Имя и фамилия
                </label>
                <input
                  type="text"
                  required
                  placeholder="Иван Петров"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Telegram / Юзернейм
                </label>
                <input
                  type="text"
                  placeholder="@ivan_petrov"
                  value={newStudentUsername}
                  onChange={(e) => setNewStudentUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  О себе (Краткое био)
                </label>
                <textarea
                  rows={2}
                  placeholder="Любимые предметы, навыки или роль в группе..."
                  value={newStudentBio}
                  onChange={(e) => setNewStudentBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Подгруппа
                  </label>
                  <select
                    value={newStudentSubgroup}
                    onChange={(e) => setNewStudentSubgroup(Number(e.target.value) as 1 | 2)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value={1}>1-я подгруппа</option>
                    <option value={2}>2-я подгруппа</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Роль в группе
                  </label>
                  <select
                    value={newStudentRole}
                    onChange={(e) =>
                      setNewStudentRole(e.target.value as 'student' | 'deputy' | 'proforg')
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="student">Студент</option>
                    <option value="deputy">Зам. старосты</option>
                    <option value="proforg">Профорг</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  Добавить в список группы
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Poll Modal */}
      {showAddPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Создать опрос для группы</h3>
              <button
                onClick={() => setShowAddPollModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Вопрос для голосования
                </label>
                <input
                  type="text"
                  required
                  placeholder="Перенос пары, тема проекта, сбор на мероприятие..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Вариант 1
                </label>
                <input
                  type="text"
                  required
                  placeholder="Да, переносим на пятницу"
                  value={pollOption1}
                  onChange={(e) => setPollOption1(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Вариант 2
                </label>
                <input
                  type="text"
                  required
                  placeholder="Нет, оставляем как есть"
                  value={pollOption2}
                  onChange={(e) => setPollOption2(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Вариант 3 (по желанию)
                </label>
                <input
                  type="text"
                  placeholder="Мне всё равно / согласен с большинством"
                  value={pollOption3}
                  onChange={(e) => setPollOption3(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  Опубликовать опрос
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
