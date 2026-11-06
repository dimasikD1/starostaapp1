import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  ExternalLink,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Link2,
  Calendar,
  Building2,
  UserCheck,
  FileText,
  Loader2,
} from 'lucide-react';
import { RucScheduleConfig, ScheduleItem, UserProfile } from '../types/starosta';
import { rucScheduleService } from '../services/rucScheduleService';

interface RucScheduleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RucScheduleConfig;
  onSaveConfig: (updated: RucScheduleConfig) => void;
  onApplySchedule: (items: ScheduleItem[]) => void;
  currentUser: UserProfile;
  starosta1: UserProfile;
  starosta2: UserProfile;
  onSelectUser: (userId: string) => void;
  onToast: (msg: string) => void;
}

export const RucScheduleSyncModal: React.FC<RucScheduleSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onApplySchedule,
  currentUser,
  starosta1,
  starosta2,
  onSelectUser,
  onToast,
}) => {
  const [portalUrl, setPortalUrl] = useState(config.portalUrl);
  const [groupCode, setGroupCode] = useState(config.groupCode);
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [activeSubgroup, setActiveSubgroup] = useState<'all' | 1 | 2>(config.activeSubgroupFilter);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message?: string;
    stats?: { total: number; subgroup1: number; subgroup2: number; common: number };
  } | null>(null);

  // Manual text import tab
  const [activeTab, setActiveTab] = useState<'online' | 'manual'>('online');
  const [rawText, setRawText] = useState('');

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await rucScheduleService.syncSchedule(portalUrl.trim(), groupCode.trim());
      setIsSyncing(false);
      setSyncResult({
        success: res.success,
        message: res.message,
        stats: res.stats,
      });

      if (res.success) {
        onApplySchedule(res.items);
        onSaveConfig({
          ...config,
          portalUrl: portalUrl.trim(),
          groupCode: groupCode.trim(),
          autoSync,
          activeSubgroupFilter: activeSubgroup,
          lastSyncedAt: res.syncedAt,
          syncStatus: 'synced',
        });
        onToast(`🎉 Расписание БИ(ЭБ) 1/2 обновлено с schedule.ruc.su (${res.stats.total} пар)!`);
      }
    } catch (e: any) {
      setIsSyncing(false);
      setSyncResult({
        success: false,
        message: e?.message || 'Ошибка подключения к schedule.ruc.su',
      });
    }
  };

  const handleParseRawText = () => {
    if (!rawText.trim()) return;
    const items = rucScheduleService.parseTextSchedule(rawText);
    onApplySchedule(items);
    onSaveConfig({
      ...config,
      portalUrl: portalUrl.trim(),
      groupCode: groupCode.trim(),
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced',
    });
    onToast(`✅ Импортировано ${items.length} пар из вставленного расписания!`);
    onClose();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      portalUrl: portalUrl.trim(),
      groupCode: groupCode.trim(),
      autoSync,
      activeSubgroupFilter: activeSubgroup,
    });
    onToast('Настройки синхронизации расписания сохранены!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                <span>schedule.ruc.su</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-sky-300">
                Краснодарский филиал РУК • БИ(ЭБ) 1/2 (2026)
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

        {/* Dual Starostas Quick Banner */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Два старосты группы:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelectUser(starosta1.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                currentUser.id === starosta1.id
                  ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Переключиться на старосту 1 п/гр"
            >
              <span>1 п/гр: {starosta1.name.split(' ')[0]}</span>
              {currentUser.id === starosta1.id && <Check className="w-2.5 h-2.5" />}
            </button>

            <button
              onClick={() => onSelectUser(starosta2.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                currentUser.id === starosta2.id
                  ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Переключиться на старосту 2 п/гр"
            >
              <span>2 п/гр: {starosta2.name.split(' ')[0]}</span>
              {currentUser.id === starosta2.id && <Check className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        {/* Tab switch: Online sync vs Text paste */}
        <div className="px-5 pt-3 bg-slate-900">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('online')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'online' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Авто-синхронизация по ссылке</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'manual' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Вставка текста</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Online Sync */}
        {activeTab === 'online' ? (
          <form onSubmit={handleSaveSettings} className="p-5 overflow-y-auto space-y-4 text-slate-200 text-xs">
            {/* RUC Portal URL box */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-sky-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
                  <Link2 className="w-4 h-4 text-sky-400" />
                  Ссылка на расписание РУК
                </span>
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Открыть сайт</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <input
                type="text"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder="https://schedule.ruc.su/?ysclid=mw43l57l8d43423857"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
              />

              <div className="text-[10px] text-slate-400">
                Официальный портал расписания Краснодарского кооперативного института РУК (Краснодарский край)
              </div>
            </div>

            {/* Target Group & Subgroup filter */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Группа</label>
                <input
                  type="text"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs"
                />
              </div>

              <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Фильтр подгруппы</label>
                <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveSubgroup('all')}
                    className={`flex-1 py-1 rounded-lg font-bold transition ${
                      activeSubgroup === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1 и 2
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubgroup(1)}
                    className={`flex-1 py-1 rounded-lg font-bold transition ${
                      activeSubgroup === 1 ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1 п/гр
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubgroup(2)}
                    className={`flex-1 py-1 rounded-lg font-bold transition ${
                      activeSubgroup === 2 ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    2 п/гр
                  </button>
                </div>
              </div>
            </div>

            {/* Sync Now Action Button */}
            <div>
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-sky-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>
                  {isSyncing ? 'Синхронизация с schedule.ruc.su...' : 'Синхронизировать расписание сейчас'}
                </span>
              </button>
            </div>

            {/* Sync Feedback Message */}
            {syncResult && (
              <div
                className={`p-3 rounded-2xl border text-[11px] space-y-1.5 ${
                  syncResult.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {syncResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{syncResult.message}</span>
                </div>

                {syncResult.stats && (
                  <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono text-[10px]">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-emerald-500/20">
                      <div>1 п/гр (Дмитрий)</div>
                      <div className="font-bold text-white text-xs">{syncResult.stats.subgroup1} пар</div>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-emerald-500/20">
                      <div>2 п/гр (Анна)</div>
                      <div className="font-bold text-white text-xs">{syncResult.stats.subgroup2} пар</div>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-emerald-500/20">
                      <div>Общие лекции</div>
                      <div className="font-bold text-white text-xs">{syncResult.stats.common} пар</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Settings: Auto-sync on startup */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between p-3 bg-slate-950/70 rounded-2xl border border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Авто-обновление при входе</div>
                    <div className="text-[10px] text-slate-400">
                      Проверять schedule.ruc.su при открытии приложения
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-900 border-slate-700"
                />
              </label>
            </div>

            {/* Save Config */}
            <div className="pt-1">
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Сохранить настройки
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Manual Text Paste */
          <div className="p-5 overflow-y-auto space-y-3 text-xs">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Если доступ к сайту требует внутренней авторизации или сайт временно недоступен, скопируйте текст расписания с портала <strong>schedule.ruc.su</strong> и вставьте сюда:
            </p>

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Понедельник&#10;1 пара 08:30-10:00 Корпоративные ИС и 1С (лекция) Ауд. 412&#10;2 пара 10:15-11:45 Компьютерный практикум 1С (лаб.) 1 п/гр Комп. класс 305&#10;2 пара 10:15-11:45 Экономическая безопасность (семинар) 2 п/гр Ауд. 204&#10;..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-white font-mono text-xs focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
            />

            <button
              type="button"
              onClick={handleParseRawText}
              disabled={!rawText.trim()}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition active:scale-95 disabled:opacity-40"
            >
              Распознать и применить расписание
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
