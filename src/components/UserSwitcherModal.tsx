import React from 'react';
import { UserProfile } from '../types/starosta';
import { X, Check, Users, PlusCircle } from 'lucide-react';

interface UserSwitcherModalProps {
  users: UserProfile[];
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onAddNewUser: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({
  users,
  currentUserId,
  isOpen,
  onClose,
  onSelectUser,
  onAddNewUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-bold text-white text-base">Сменить студента</h3>
              <p className="text-[11px] text-slate-400">
                Переключайтесь, чтобы тестировать профили и взаимодействия
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-800/40">
          {users.map((u) => {
            const isSelected = u.id === currentUserId;
            return (
              <button
                key={u.id}
                onClick={() => {
                  onSelectUser(u.id);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition ${
                  isSelected
                    ? 'bg-sky-950/60 border border-sky-500/40 text-white'
                    : 'hover:bg-slate-800/70 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                        u.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                      <span className="text-white">{u.name}</span>
                      {u.role === 'starosta' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-medium border border-amber-500/30">
                          Староста
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-sky-400 font-mono truncate">{u.username}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {u.bio || `${u.subgroup}-я подгруппа`}
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 hover:text-slate-300 shrink-0">
                    Войти
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={() => {
              onClose();
              onAddNewUser();
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-sky-400 flex items-center justify-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Добавить нового студента в группу</span>
          </button>
        </div>
      </div>
    </div>
  );
};
