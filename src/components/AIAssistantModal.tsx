import React, { useState } from 'react';
import { generateStarostaText } from '../services/geminiService';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Share2,
  FileText,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishToChannel: (title: string, content: string) => void;
  groupCode: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onPublishToChannel,
  groupCode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'announcement' | 'excuse_note' | 'deadline_summary' | 'custom'>('announcement');
  const [tone, setTone] = useState<'friendly' | 'urgent' | 'formal'>('friendly');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (presetPrompt?: string, presetType?: typeof type) => {
    const activePrompt = presetPrompt || prompt;
    const activeType = presetType || type;
    if (!activePrompt.trim()) return;

    setIsLoading(true);
    setResult('');
    try {
      const text = await generateStarostaText({
        type: activeType,
        prompt: activePrompt,
        tone,
        groupName: groupCode,
      });
      setResult(text);
    } catch (e) {
      console.error(e);
      setResult('Ошибка генерации. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = () => {
    const lines = result.split('\n').filter((l) => l.trim().length > 0);
    const title = lines[0]?.replace(/[#*]/g, '').trim() || 'Объявление старостата';
    const content = lines.slice(1).join('\n').trim() || result;
    onPublishToChannel(title, content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">ИИ-Помощник Старосты 24</h3>
              <p className="text-[11px] text-indigo-300">
                Генератор объявлений, рапортичек и обращений в деканат
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* Quick Preset Buttons */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Быстрые шаблоны:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setType('announcement');
                  setTone('urgent');
                  setPrompt('Срочно сдать все медицинские справки и отчеты по лабам до 21:00');
                  handleGenerate('Срочно сдать все медицинские справки и отчеты по лабам до 21:00', 'announcement');
                }}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Срочный дедлайн</div>
                  <div className="text-[10px] text-slate-400">Справки и долги</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('excuse_note');
                  setTone('formal');
                  setPrompt('Ежедневная рапортичка старосты в деканат');
                  handleGenerate('Ежедневная рапортичка старосты в деканат', 'excuse_note');
                }}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition flex items-start gap-2"
              >
                <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Рапортичка декану</div>
                  <div className="text-[10px] text-slate-400">Официальная форма</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('deadline_summary');
                  setTone('friendly');
                  setPrompt('Сводка дедлайнов на ближайшую неделю');
                  handleGenerate('Сводка дедлайнов на ближайшую неделю', 'deadline_summary');
                }}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition flex items-start gap-2"
              >
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Сводка недели</div>
                  <div className="text-[10px] text-slate-400">План сдачи ДЗ</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('announcement');
                  setTone('friendly');
                  setPrompt('Напоминание о переносе семинара по матанализу и подготовке к коллоквиуму');
                  handleGenerate('Напоминание о переносе семинара по матанализу и подготовке к коллоквиуму', 'announcement');
                }}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition flex items-start gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Перенос пары</div>
                  <div className="text-[10px] text-slate-400">Дружелюбный тон</div>
                </div>
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Тон сообщения:
            </label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTone('friendly')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                  tone === 'friendly' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Дружелюбный
              </button>
              <button
                type="button"
                onClick={() => setTone('urgent')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                  tone === 'urgent' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Срочный 🚨
              </button>
              <button
                type="button"
                onClick={() => setTone('formal')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition ${
                  tone === 'formal' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Официальный 📜
              </button>
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Что нужно написать (запрос):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="О чем объявление? Например: Напомни сдать лабу №3 до пятницы..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Создать</span>
              </button>
            </div>
          </div>

          {/* Result Output */}
          {result && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Сгенерированный текст:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {result}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handlePublish}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Опубликовать в канал группы</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
