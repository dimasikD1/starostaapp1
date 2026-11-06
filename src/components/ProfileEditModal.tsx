import React, { useState } from 'react';
import { UserProfile } from '../types/starosta';
import { X, Camera, Check, Upload, Sparkles, User, AtSign, FileText } from 'lucide-react';

interface ProfileEditModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534751516642-a171ed22cb71?w=240&auto=format&fit=crop&q=80',
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [bio, setBio] = useState(user.bio);
  const [statusText, setStatusText] = useState(user.statusText || '');
  const [subgroup, setSubgroup] = useState<1 | 2>(user.subgroup);
  const [phone, setPhone] = useState(user.phone || '');
  const [telegram, setTelegram] = useState(user.telegram || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedUsername = username.trim();
    if (formattedUsername && !formattedUsername.startsWith('@')) {
      formattedUsername = `@${formattedUsername}`;
    }

    const updated: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      username: formattedUsername || user.username,
      avatar: avatar || user.avatar,
      bio: bio.trim(),
      statusText: statusText.trim(),
      subgroup,
      phone: phone.trim(),
      telegram: telegram.trim() || formattedUsername,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">Редактирование профиля</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5 text-slate-200">
          {/* Avatar Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Фото профиля (Аватар)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatar}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-sky-500 shadow-md"
                />
                <label className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition">
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5">Сменить</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Загрузить фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
                  >
                    По ссылке
                  </button>
                </div>

                <div className="text-[11px] text-slate-400">
                  Выберите готовый аватар ниже или загрузите свой снимок
                </div>
              </div>
            </div>

            {/* Custom URL input */}
            {showUrlInput && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrlInput.trim()) {
                      setAvatar(customUrlInput.trim());
                      setCustomUrlInput('');
                      setShowUrlInput(false);
                    }
                  }}
                  className="px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-semibold"
                >
                  Применить
                </button>
              </div>
            )}

            {/* Preset Avatars Carousel */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">
                Готовые студенческие аватары:
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {PRESET_AVATARS.map((presetUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(presetUrl)}
                    className={`relative shrink-0 rounded-xl overflow-hidden ring-2 transition ${
                      avatar === presetUrl ? 'ring-sky-400 scale-105' : 'ring-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={presetUrl} alt="Preset avatar" className="w-12 h-12 object-cover" />
                    {avatar === presetUrl && (
                      <div className="absolute inset-0 bg-sky-500/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Имя и фамилия</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Дмитрий Дунаев"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Username (@handle) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-sky-400" />
              <span>Юзернейм (Telegram / Starosta)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              По этому юзернейму другие студенты смогут обращаться к вам в чатах и рапортичках
            </p>
          </div>

          {/* Short Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>О себе (Краткое био)</span>
              </label>
              <span className={`text-[11px] ${bio.length > 180 ? 'text-rose-400' : 'text-slate-500'}`}>
                {bio.length}/200
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о своей роли в группе, любимых предметах или как с вами связаться..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none"
            />
            {/* Quick Bio snippet suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Староста группы • По всем вопросам в лс 24/7',
                '1 подгруппа • Помогу с лабами по SQL',
                'Замстаросты • Веду учет конспектов лекций',
                'Профорг • Вопросы по стипендиям и путевкам',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBio(suggestion)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 rounded-md px-2 py-0.5 transition"
                >
                  +{suggestion.slice(0, 24)}...
                </button>
              ))}
            </div>
          </div>

          {/* Current Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Текущий статус (что делаете)
            </label>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="Например: На лекции по ОС, Готовлюсь к сессии..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Subgroup & Contacts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Подгруппа
              </label>
              <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setSubgroup(1)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                    subgroup === 1 ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1-я
                </button>
                <button
                  type="button"
                  onClick={() => setSubgroup(2)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                    subgroup === 2 ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2-я
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Телефон (по желанию)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Сохранить профиль</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
