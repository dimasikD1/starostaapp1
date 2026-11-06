import React, { useState } from 'react';
import { TelegramBinding, GroupMeta } from '../types/starosta';
import { telegramBotService, VerifyTokenResult } from '../services/telegramBotService';
import {
  Send,
  X,
  Check,
  Bell,
  Key,
  Layers,
  Bot,
  ExternalLink,
  Shield,
  Smartphone,
  Globe,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Play,
  RotateCcw,
} from 'lucide-react';

interface TelegramBindingModalProps {
  binding: TelegramBinding;
  groupMeta: GroupMeta;
  starostaUser: any;
  starostaMandate: any;
  students: any[];
  todayClasses: any[];
  currentPairRecord: any;
  homework: any[];
  poll?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: TelegramBinding) => void;
  onSendTestNotification: (message: string) => void;
}

export const TelegramBindingModal: React.FC<TelegramBindingModalProps> = ({
  binding,
  groupMeta,
  starostaUser,
  starostaMandate,
  students,
  todayClasses,
  currentPairRecord,
  homework,
  poll,
  isOpen,
  onClose,
  onSave,
  onSendTestNotification,
}) => {
  const [botToken, setBotToken] = useState(binding.botToken || '');
  const [chatId, setChatId] = useState(binding.chatId || '');
  const [telegramUsername, setTelegramUsername] = useState(binding.telegramUsername || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(binding.notificationsEnabled);
  const [autoSendJournal, setAutoSendJournal] = useState(binding.autoSendJournal);
  const [vkChatUrl, setVkChatUrl] = useState(binding.vkChatUrl || '');
  const [universityPortalUrl, setUniversityPortalUrl] = useState(binding.universityPortalUrl || '');

  // Verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyTokenResult | null>(null);

  // Command setup state
  const [isConfiguringCommands, setIsConfiguringCommands] = useState(false);
  const [commandsConfigured, setCommandsConfigured] = useState(false);

  // Send message state
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  // Bot Simulator active view
  const [activeTab, setActiveTab] = useState<'settings' | 'simulator'>('settings');
  const [simulatedMessages, setSimulatedMessages] = useState<
    { sender: 'user' | 'bot'; text: string; buttons?: any[][] }[]
  >([
    {
      sender: 'bot',
      text: '🤖 Бот «Староста 24» готов к работе. Отправьте команду или нажмите кнопку ниже:',
      buttons: [
        [
          { text: '📋 /journal', callback_data: '/journal' },
          { text: '📅 /schedule', callback_data: '/schedule' },
        ],
        [
          { text: '📝 /homework', callback_data: '/homework' },
          { text: '👑 /starosta', callback_data: '/starosta' },
        ],
      ],
    },
  ]);

  if (!isOpen) return null;

  // Verify Bot Token directly with Telegram API
  const handleVerifyToken = async () => {
    if (!botToken.trim()) {
      setVerifyResult({ success: false, error: 'Введите токен бота от @BotFather' });
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);

    const result = await telegramBotService.verifyBotToken(botToken.trim());
    setIsVerifying(false);
    setVerifyResult(result);

    if (result.success && result.bot?.username) {
      onSendTestNotification(`🟢 Токен подтвержден! Бот @${result.bot.username} подключен к группе ${groupMeta.code}`);
    }
  };

  // Register commands and menu button in Telegram
  const handleSetupCommands = async () => {
    if (!botToken.trim()) return;

    setIsConfiguringCommands(true);
    const webAppUrl = window.location.origin;
    const res = await telegramBotService.registerCommands(botToken.trim(), webAppUrl);
    setIsConfiguringCommands(false);

    if (res.success) {
      setCommandsConfigured(true);
      onSendTestNotification('✅ Команды /journal, /schedule, /homework, /starosta зарегистрированы в Telegram!');
      setTimeout(() => setCommandsConfigured(false), 3000);
    } else {
      alert(`Ошибка настройки команд: ${res.error}`);
    }
  };

  // Send Real Message via Bot
  const handleSendRealMessage = async (text: string) => {
    if (!botToken.trim() || !chatId.trim()) {
      alert('Для отправки укажите валидный Токен бота и Chat ID (например, @group_chat или числовой ID)');
      return;
    }

    setIsSendingMessage(true);
    setSendSuccessMessage(null);
    setSendErrorMessage(null);

    const res = await telegramBotService.sendMessage(botToken.trim(), chatId.trim(), text);
    setIsSendingMessage(false);

    if (res.success) {
      setSendSuccessMessage('Сообщение успешно отправлено в Telegram!');
      onSendTestNotification('🚀 Сообщение отправлено ботом в Telegram!');
      setTimeout(() => setSendSuccessMessage(null), 3000);
    } else {
      setSendErrorMessage(res.error || 'Ошибка отправки');
    }
  };

  // Bot Simulator Command Trigger
  const handleSimulateCommand = (cmd: string) => {
    const response = telegramBotService.generateCommandResponse(cmd, {
      groupMeta,
      starostaUser,
      starostaMandate,
      students,
      todayClasses,
      currentPairRecord,
      homework,
      poll,
    });

    setSimulatedMessages((prev) => [
      ...prev,
      { sender: 'user', text: cmd },
      { sender: 'bot', text: response.text, buttons: response.buttons },
    ]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let formattedUsername = telegramUsername.trim();
    if (formattedUsername && !formattedUsername.startsWith('@')) {
      formattedUsername = `@${formattedUsername}`;
    }

    const updated: TelegramBinding = {
      ...binding,
      isBound: !!botToken.trim(),
      botToken: botToken.trim(),
      botUsername: verifyResult?.bot?.username ? `@${verifyResult.bot.username}` : binding.botUsername,
      botFirstName: verifyResult?.bot?.first_name || binding.botFirstName,
      botId: verifyResult?.bot?.id ? String(verifyResult.bot.id) : binding.botId,
      chatId: chatId.trim(),
      telegramUsername: formattedUsername,
      notificationsEnabled,
      autoSendJournal,
      vkChatUrl: vkChatUrl.trim(),
      universityPortalUrl: universityPortalUrl.trim(),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Интеграция Telegram-бота</h3>
              <p className="text-[11px] text-sky-300">
                Подключение по Bot Token от @BotFather
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

        {/* Section Tabs: Settings vs Live Simulator */}
        <div className="px-5 pt-3 bg-slate-900">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'settings' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Токен и настройки</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'simulator' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Тест команд бота</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'settings' ? (
          <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-slate-200 text-xs">
            {/* Bot Token Section */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-sky-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
                  <Key className="w-4 h-4 text-sky-400" />
                  Токен Telegram-бота (Bot Token)
                </span>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Получить в @BotFather</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxyz"
                  value={botToken}
                  onChange={(e) => {
                    setBotToken(e.target.value);
                    setVerifyResult(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  Вставьте токен, выданный официальным ботом Telegram @BotFather при создании бота
                </div>
              </div>

              {/* Verify button & status */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleVerifyToken}
                  disabled={isVerifying || !botToken.trim()}
                  className="py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95 text-xs"
                >
                  {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Проверить токен</span>
                </button>

                {botToken.trim() && (
                  <button
                    type="button"
                    onClick={handleSetupCommands}
                    disabled={isConfiguringCommands}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl font-semibold transition flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    {isConfiguringCommands ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : commandsConfigured ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                    <span>{commandsConfigured ? 'Команды заданы!' : 'Настроить меню'}</span>
                  </button>
                )}
              </div>

              {/* Verification Feedback */}
              {verifyResult && (
                <div
                  className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                    verifyResult.success
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {verifyResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <strong>Бот подключен: </strong>
                        @{verifyResult.bot?.username} ({verifyResult.bot?.first_name})
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>{verifyResult.error}</div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Chat ID / Channel ID section */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  Chat ID группы или канала
                </span>
                <span className="text-[10px] text-slate-500">куда слать рапортички</span>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="@ivt_22_1_polytech или -100123456789"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  Добавьте вашего бота администратором в чат группы и укажите юзернейм или ID чата
                </div>
              </div>

              {/* Action: Send attendance report to chat */}
              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const report = telegramBotService.generateCommandResponse('/journal', {
                      groupMeta,
                      starostaUser,
                      starostaMandate,
                      students,
                      todayClasses,
                      currentPairRecord,
                      homework,
                      poll,
                    });
                    handleSendRealMessage(report.text);
                  }}
                  disabled={isSendingMessage || !botToken.trim()}
                  className="flex-1 py-2 px-2.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Отправить рапортичку в чат TG</span>
                </button>
              </div>

              {sendSuccessMessage && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{sendSuccessMessage}</span>
                </div>
              )}
              {sendErrorMessage && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{sendErrorMessage}</span>
                </div>
              )}
            </div>

            {/* Starosta handle & Auto-sync */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Ваш Telegram (юзернейм старосты)
                </label>
                <input
                  type="text"
                  placeholder="@dima_starosta"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Авторассылка рапортичек</div>
                      <div className="text-[10px] text-slate-400">Отправлять отчет в чат группы после 1-й пары</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSendJournal}
                    onChange={(e) => setAutoSendJournal(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Сохранить токен и настройки</span>
              </button>
            </div>
          </form>
        ) : (
          /* TAB 2: TELEGRAM BOT SIMULATOR (КОНСОЛЬ КОМАНД БОТА) */
          <div className="p-4 flex flex-col h-[460px] overflow-hidden text-xs">
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] text-slate-300">
                  {verifyResult?.bot?.username ? `@${verifyResult.bot.username}` : '@Starosta24_bot'}
                </span>
              </div>
              <button
                onClick={() =>
                  setSimulatedMessages([
                    {
                      sender: 'bot',
                      text: '🤖 Бот «Староста 24» готов к работе. Нажмите команду:',
                      buttons: [
                        [
                          { text: '📋 /journal', callback_data: '/journal' },
                          { text: '📅 /schedule', callback_data: '/schedule' },
                        ],
                      ],
                    },
                  ])
                }
                className="text-slate-500 hover:text-slate-300 p-1"
                title="Очистить"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {simulatedMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-sky-600 text-white font-medium rounded-br-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Inline Buttons under Bot Message */}
                  {msg.buttons && (
                    <div className="w-full max-w-[88%] mt-1.5 space-y-1">
                      {msg.buttons.map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-1">
                          {row.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => {
                                if (btn.callback_data) {
                                  handleSimulateCommand(btn.callback_data);
                                } else if (btn.url) {
                                  window.open(btn.url, '_blank');
                                }
                              }}
                              className="flex-1 py-1.5 px-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-xl text-[11px] font-semibold text-sky-300 transition text-center"
                            >
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Command Buttons */}
            <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                Быстрые команды для бота:
              </div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSimulateCommand('/journal')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl font-bold border border-slate-700 text-center"
                >
                  /journal
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCommand('/schedule')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-bold border border-slate-700 text-center"
                >
                  /schedule
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCommand('/homework')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl font-bold border border-slate-700 text-center"
                >
                  /homework
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCommand('/starosta')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-xl font-bold border border-slate-700 text-center"
                >
                  /starosta
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCommand('/poll')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl font-bold border border-slate-700 text-center"
                >
                  /poll
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateCommand('/start')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold border border-slate-700 text-center"
                >
                  /start
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
