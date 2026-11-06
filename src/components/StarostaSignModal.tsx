import React, { useState } from 'react';
import { UserProfile, StarostaMandate, GroupMeta } from '../types/starosta';
import {
  ShieldCheck,
  X,
  FileCheck2,
  Sparkles,
  Award,
  Calendar,
  Check,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StarostaSignModalProps {
  currentUser: UserProfile;
  groupMeta: GroupMeta;
  mandate: StarostaMandate;
  isOpen: boolean;
  onClose: () => void;
  onSignMandate: (updatedMandate: StarostaMandate, updatedUser: UserProfile) => void;
}

export const StarostaSignModal: React.FC<StarostaSignModalProps> = ({
  currentUser,
  groupMeta,
  mandate,
  isOpen,
  onClose,
  onSignMandate,
}) => {
  const [fullName, setFullName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [signatureText, setSignatureText] = useState(
    mandate.signatureText || `${currentUser.name.split(' ')[0]} ${currentUser.name.split(' ')[1]?.[0] || 'Д'}.`
  );
  const [orderNumber, setOrderNumber] = useState(
    mandate.orderNumber || 'Протокол студсовета №1-26'
  );
  const [term, setTerm] = useState(mandate.term || '2026/2027 учебный год');
  const [statementText, setStatementText] = useState(
    'Я, студент(ка) группы ' +
      groupMeta.code +
      ', добровольно принимаю на себя полномочия и ответственность старосты академической группы. Обязуюсь вести учет посещаемости, информировать группу о распоряжениях деканата и представлять интересы студентов.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: UserProfile = {
      ...currentUser,
      name: fullName.trim() || currentUser.name,
      username: username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`,
      role: 'starosta',
      roleTitle: 'Староста',
      badges: Array.from(new Set(['👑 Староста', '🛡️ Актив факультета', ...(currentUser.badges || [])])),
    };

    const updatedMandate: StarostaMandate = {
      isSigned: true,
      starostaUserId: currentUser.id,
      signedAt: new Date().toISOString(),
      signatureText: signatureText.trim() || fullName.trim(),
      orderNumber: orderNumber.trim(),
      term: term.trim(),
    };

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onSignMandate(updatedMandate, updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/50 via-slate-900 to-sky-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Подписание полномочий старосты</h3>
              <p className="text-[11px] text-amber-300">
                Официальное подтверждение статуса старосты группы
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* Certificate / Mandate Preview Card */}
          <div className="bg-gradient-to-b from-amber-500/10 to-slate-950/60 p-4 rounded-2xl border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Мандат старостата • {groupMeta.code}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {term}
              </span>
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{statementText}"
            </p>
          </div>

          {/* Full Name & Username */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                ФИО Старосты
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Telegram (@юзернейм)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Digital Signature Text & Order Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Электронная подпись (ФИО сокращ.)
              </label>
              <input
                type="text"
                required
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Иванов И.И."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Основание / Приказ
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Протокол студсовета №1-26"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Period / Term */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Период полномочий
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="2026/2027 учебный год"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Declaration Note */}
          <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              После подписания ваш профиль получит значок <strong>«Староста группы»</strong>, а ваши сообщения в канале будут помечаться официальным статусом старостата.
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Подписать себя старостой и утвердить мандат</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
