import React, { useState } from 'react';
import {
  Download,
  X,
  Smartphone,
  Check,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  QrCode,
  FileCheck2,
  Package,
  GitBranch,
  Globe,
  FolderArchive,
  ArrowRight,
} from 'lucide-react';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  onInstallWebApk?: () => void;
  isInstallable?: boolean;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  onInstallWebApk,
  isInstallable,
}) => {
  const [modalTab, setModalTab] = useState<'apk' | 'github_netlify'>('github_netlify');
  const [copied, setCopied] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gitCommands = `# 1. Создайте пустой репозиторий на github.com
git remote add origin https://github.com/ВАШ_ЛОГИН/starosta24.git
git branch -M main
git push -u origin main`;

  const handleCopyGitCmd = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2000);
  };

  // PWABuilder direct URL for building Android APK (TWA)
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/60 via-slate-900 to-sky-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Публикация и скачивание</h3>
              <p className="text-[11px] text-emerald-300">
                GitHub • Netlify • Android APK • PWA
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

        {/* Modal Switcher Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2">
          <button
            onClick={() => setModalTab('github_netlify')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
              modalTab === 'github_netlify'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GitHub & Netlify</span>
            <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded font-mono">NEW</span>
          </button>
          <button
            onClick={() => setModalTab('apk')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition ${
              modalTab === 'apk'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Установка на телефон</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200 text-xs">
          {modalTab === 'github_netlify' ? (
            <div className="space-y-4">
              {/* Option A: 1-Click Netlify Drop (Fastest & No terminal needed!) */}
              <div className="bg-gradient-to-br from-teal-950/50 via-slate-900 to-sky-950/40 p-4 rounded-2xl border border-teal-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-400 flex items-center gap-1.5 text-xs">
                    <Globe className="w-4 h-4" />
                    Вариант 1: Запуск на Netlify за 30 секунд (без терминала)
                  </span>
                  <span className="text-[9px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.5 rounded">
                    Самый быстрый
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Мы уже скомпилировали продакшн-версию с правильным <code>netlify.toml</code>, PWA-манифестом и Service Worker.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="/starosta24-dist.zip"
                    download="starosta24-dist.zip"
                    className="py-2.5 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Скачать dist.zip (950 КБ)</span>
                  </a>

                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Открыть Netlify Drop</span>
                  </a>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-teal-300">Инструкция Netlify Drop:</div>
                  <div>1. Нажмите <strong>«Скачать dist.zip»</strong> выше.</div>
                  <div>2. Перейдите на <strong>app.netlify.com/drop</strong> (бесплатно, вход через Google/GitHub).</div>
                  <div>3. Перетащите скачанный zip-архив в окно браузера.</div>
                  <div>4. <strong>Готово!</strong> Приложение моментально развернется на вашем постоянном адресе <code>https://ваше-имя.netlify.app</code> с HTTPS.</div>
                </div>
              </div>

              {/* Option B: GitHub Repository (Complete source code) */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
                    <GitBranch className="w-4 h-4" />
                    Вариант 2: Создать репозиторий на GitHub для Netlify
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Чтобы Netlify автоматически собирал сайт из GitHub, вам нужен репозиторий со статусом <strong>Public</strong> на вашем GitHub-аккаунте:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>1. Открыть github.com/new</span>
                  </a>

                  <a
                    href="/starosta24-src.zip"
                    download="starosta24-src.zip"
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/40 font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center text-xs"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>2. Скачать исходники (.zip)</span>
                  </a>
                </div>

                {/* 4 simple steps */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-2">
                  <div className="font-semibold text-sky-300">Пошаговая инструкция (как открыть и связать):</div>
                  <div className="space-y-1.5 pl-1">
                    <p><strong>Шаг 1:</strong> Перейдите на <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">github.com/new</a>. Введите имя репозитория (например: <code>starosta24</code>).</p>
                    <p><strong>Шаг 2 (важно):</strong> Поставьте переключатель <strong>«Public»</strong> (чтобы Netlify увидел его сразу без ограничений прав). Галочки <em>Add README</em> и <em>.gitignore</em> <u>НЕ ставьте</u> (они уже есть в проекте). Нажмите зеленую кнопку <strong>«Create repository»</strong>.</p>
                    <p><strong>Шаг 3:</strong> На странице созданного репозитория нажмите ссылку <strong>«uploading an existing file»</strong> $\rightarrow$ распакуйте скачанный <code>starosta24-src.zip</code> и перетащите все файлы туда $\rightarrow$ нажмите <strong>«Commit changes»</strong>.</p>
                    <p><strong>Шаг 4:</strong> Откройте <a href="https://app.netlify.com" target="_blank" rel="noreferrer" className="text-teal-400 underline font-semibold">app.netlify.com</a> $\rightarrow$ нажмите <strong>«Add new site»</strong> $\rightarrow$ <strong>«Import from Git»</strong> $\rightarrow$ выберите GitHub и репозиторий <code>starosta24</code> $\rightarrow$ нажмите <strong>«Deploy»</strong>!</p>
                  </div>
                </div>

                {/* Terminal Commands */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Если загружаете через Git в консоли:</span>
                    <button
                      onClick={handleCopyGitCmd}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      {copiedGitCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedGitCmd ? 'Скопировано!' : 'Копировать команды'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 p-2.5 rounded-xl text-[10px] font-mono text-sky-300 overflow-x-auto border border-slate-800 leading-relaxed select-all">
{gitCommands}
                  </pre>
                </div>
              </div>

              {/* Netlify + GitHub Continuous Deployment tip */}
              <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-white">💡 Напоминание: Самый быстрый путь без GitHub:</div>
                <p>
                  Если не хотите настраивать GitHub прямо сейчас, используйте <strong>Вариант 1 выше (Netlify Drop)</strong> — просто перетащите скачанный <code>dist.zip</code> на <strong>app.netlify.com/drop</strong>, и сайт запустится ровно за 15 секунд!
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Method 1: Instant Google WebAPK (Standard official Android method) */}
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                    <Smartphone className="w-4 h-4" />
                    Способ 1: Прямая установка WebAPK в Android
                  </span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                    Рекомендуется
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  В системе Android встроен сервис <strong>Google WebAPK Minting</strong>. При нажатии «Установить» операционная система автоматически собирает и устанавливает APK-пакет прямо на телефон без сторонних сайтов.
                </p>

                <button
                  onClick={() => {
                    if (onInstallWebApk) {
                      onInstallWebApk();
                    }
                    setShowManualGuide(true);
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Установить APK на телефон в 1 клик</span>
                </button>

                {showManualGuide && (
                  <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-200">
                    💡 Если окно установки не появилось автоматически: нажмите на значок меню браузера <strong>(⋮)</strong> вверху и выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                  </div>
                )}
              </div>

              {/* Method 2: Download raw standalone APK file via PWABuilder (TWA) */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5 text-xs">
                    <Layers className="w-4 h-4" />
                    Способ 2: Скачать автономный APK-файл (TWA)
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  После публикации на постоянном адресе Netlify используйте официальный билдер от Microsoft & Google для сборки APK для <strong>RuStore / Google Play</strong>:
                </p>

                <a
                  href={pwaBuilderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Собрать и скачать .APK в PWABuilder</span>
                </a>
              </div>

              {/* App URL box for manual entry */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>URL приложения для установки:</span>
                  <button
                    onClick={handleCopy}
                    className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl text-[11px] font-mono text-slate-300 truncate border border-slate-800">
                  {appUrl}
                </div>
              </div>

              {/* Manual instructions for Android Chrome / Yandex */}
              <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-700/50 space-y-1 text-[11px] text-slate-400">
                <div className="font-semibold text-white mb-1">Как установить прямо сейчас на телефон:</div>
                <div>1. Откройте эту страницу на смартфоне в Яндекс Браузере или Chrome.</div>
                <div>2. Нажмите меню <strong>«три точки» (⋮)</strong> в правом верхнем углу.</div>
                <div>3. Выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</div>
                <div>4. Готово! Приложение появится как отдельная программа со значком на рабочем столе.</div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
