import React, { useState } from 'react';
import { Announcement, UserProfile, Comment } from '../../types/starosta';
import {
  MessageCircle,
  Pin,
  Send,
  Plus,
  Smile,
  X,
  Share2,
  Sparkles,
  Award,
} from 'lucide-react';

interface ChannelTabProps {
  announcements: Announcement[];
  currentUser: UserProfile;
  users: UserProfile[];
  onAddAnnouncement: (announcement: Announcement) => void;
  onAddComment: (announcementId: string, text: string) => void;
  onToggleReaction: (announcementId: string, emoji: string, userId: string) => void;
  onOpenProfile: (user: UserProfile) => void;
  onOpenAI: () => void;
}

export const ChannelTab: React.FC<ChannelTabProps> = ({
  announcements,
  currentUser,
  users,
  onAddAnnouncement,
  onAddComment,
  onToggleReaction,
  onOpenProfile,
  onOpenAI,
}) => {
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCommentSection, setActiveCommentSection] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'important' | 'dean' | 'homework' | 'event'>('important');
  const [isPinned, setIsPinned] = useState(false);

  const availableEmojis = ['👍', '🔥', '❤️', '👏', '🫡', '👀'];

  const handlePostComment = (announcementId: string) => {
    const text = commentInputs[announcementId]?.trim();
    if (!text) return;

    onAddComment(announcementId, text);
    setCommentInputs((prev) => ({ ...prev, [announcementId]: '' }));
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      authorId: currentUser.id,
      title: title.trim(),
      content: content.trim(),
      timestamp: 'Только что',
      pinned: isPinned,
      category,
      reactions: { '👍': [currentUser.id] },
      comments: [],
    };

    onAddAnnouncement(newAnn);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setShowAddModal(false);
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto pb-8">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800/90 rounded-3xl p-4 border border-slate-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/15 rounded-xl text-sky-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Канал группы и объявления</h2>
              <p className="text-[11px] text-slate-400">
                Официальные оповещения старостата с обсуждениями
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Написать</span>
          </button>
        </div>

        {/* Current User Commenting Banner */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Вы вошли как:</span>
            <button
              onClick={() => onOpenProfile(currentUser)}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-semibold"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span>{currentUser.name}</span>
              <span className="text-slate-500 font-mono text-[10px]">({currentUser.username})</span>
            </button>
          </div>
          <button
            onClick={onOpenAI}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            <span>Помощь ИИ</span>
          </button>
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.map((ann) => {
          const author = users.find((u) => u.id === ann.authorId) || currentUser;
          const isCommentsOpen = activeCommentSection === ann.id;

          return (
            <div
              key={ann.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 shadow-sm transition space-y-3.5 ${
                ann.pinned
                  ? 'border-sky-500/40 bg-gradient-to-b from-sky-950/20 to-slate-900/90 ring-1 ring-sky-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Pinned pill if applicable */}
              {ann.pinned && (
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                  <Pin className="w-3.5 h-3.5" />
                  <span>Закрепленное сообщение старосты</span>
                </div>
              )}

              {/* Author Profile Header - Clickable per prompt requirements */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onOpenProfile(author)}
                  className="flex items-center gap-2.5 text-left group"
                  title={`Открыть профиль ${author.name}`}
                >
                  <div className="relative">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 group-hover:ring-sky-400 transition"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                        author.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-sky-300 transition flex items-center gap-1.5">
                      <span>{author.name}</span>
                      {author.role === 'starosta' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 rounded font-medium border border-amber-500/30">
                          Староста
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-sky-400 font-mono">
                      {author.username}
                    </div>
                  </div>
                </button>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500">{ann.timestamp}</span>
                </div>
              </div>

              {/* Title & Body Content */}
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </p>
              </div>

              {/* Emoji Reactions with User Profiles Tooltips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {availableEmojis.map((emoji) => {
                  const voterIds = ann.reactions[emoji] || [];
                  const hasVoted = voterIds.includes(currentUser.id);
                  const count = voterIds.length;

                  return (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction(ann.id, emoji, currentUser.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 ${
                        hasVoted
                          ? 'bg-sky-500/20 border border-sky-500 text-sky-300 font-bold'
                          : count > 0
                          ? 'bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:bg-slate-800'
                          : 'bg-slate-900/60 border border-slate-800/60 text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                      title={
                        count > 0
                          ? `Отреагировали: ${voterIds
                              .map((id) => users.find((u) => u.id === id)?.name || id)
                              .join(', ')}`
                          : undefined
                      }
                    >
                      <span>{emoji}</span>
                      {count > 0 && <span className="font-mono text-[11px]">{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Comments Section Toggle Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() =>
                    setActiveCommentSection(isCommentsOpen ? null : ann.id)
                  }
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>
                    {ann.comments.length > 0
                      ? `Комментарии (${ann.comments.length})`
                      : 'Оставить первый комментарий'}
                  </span>
                </button>
                <span className="text-[10px] text-slate-500">
                  Нажмите на профиль автора в комментарии
                </span>
              </div>

              {/* Expandable Comments List (Full interaction between profiles!) */}
              {isCommentsOpen && (
                <div className="space-y-2.5 pt-2 animate-fade-in">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {ann.comments.map((comment) => {
                      const commentAuthor =
                        users.find((u) => u.id === comment.authorId) || currentUser;

                      return (
                        <div
                          key={comment.id}
                          className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2.5"
                        >
                          {/* Clicking commenter avatar opens User Profile Sheet! */}
                          <button
                            onClick={() => onOpenProfile(commentAuthor)}
                            className="shrink-0 mt-0.5"
                            title={`Посмотреть профиль ${commentAuthor.name}`}
                          >
                            <img
                              src={commentAuthor.avatar}
                              alt={commentAuthor.name}
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 hover:ring-sky-400 transition"
                            />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <button
                                onClick={() => onOpenProfile(commentAuthor)}
                                className="text-left font-bold text-xs text-white hover:text-sky-400 transition truncate flex items-center gap-1"
                              >
                                <span>{commentAuthor.name}</span>
                                <span className="text-[10px] text-sky-400 font-mono">
                                  {commentAuthor.username}
                                </span>
                              </button>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {comment.timestamp}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 mt-1 leading-snug">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-2 pt-1">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-sky-500 shrink-0"
                    />
                    <input
                      type="text"
                      placeholder={`Ответить от ${currentUser.name.split(' ')[0]}...`}
                      value={commentInputs[ann.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [ann.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePostComment(ann.id);
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={() => handlePostComment(ann.id)}
                      className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition active:scale-95 shrink-0"
                      title="Отправить комментарий"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Write Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Новое объявление в канал</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs text-slate-300">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Заголовок объявления
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: 📢 Сверка справок и рапортичка за неделю"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Текст сообщения
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Подробно опишите информацию для студентов, дедлайны и требования..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 bg-slate-800 border-slate-700"
                  />
                  <span>Закрепить вверху канала</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    onOpenAI();
                  }}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Помощь ИИ</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  Опубликовать для группы
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
