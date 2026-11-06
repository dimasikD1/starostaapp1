export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
}

export interface VerifyTokenResult {
  success: boolean;
  bot?: TelegramUser;
  error?: string;
}

export const telegramBotService = {
  /**
   * Verify Telegram Bot Token by calling getMe
   */
  async verifyBotToken(token: string): Promise<VerifyTokenResult> {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, error: 'Токен бота не может быть пустым' };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
      const data = await res.json();

      if (data.ok && data.result) {
        return {
          success: true,
          bot: data.result,
        };
      } else {
        return {
          success: false,
          error: data.description || 'Неверный токен бота (401 Unauthorized)',
        };
      }
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Ошибка подключения к серверам Telegram API',
      };
    }
  },

  /**
   * Register official commands in the bot so users see them in the Telegram menu
   */
  async registerCommands(token: string, webAppUrl?: string): Promise<{ success: boolean; error?: string }> {
    const cleanToken = token.trim();
    if (!cleanToken) return { success: false, error: 'Токен не указан' };

    try {
      const commands = [
        { command: 'start', description: 'Запустить бота и меню Староста 24' },
        { command: 'journal', description: 'Журнал посещаемости и рапортичка на сегодня' },
        { command: 'schedule', description: 'Расписание пар на сегодня и неделю' },
        { command: 'homework', description: 'Горящие дедлайны и задания группы' },
        { command: 'starosta', description: 'Мандат и контакты старосты группы' },
        { command: 'poll', description: 'Активный опрос группы' },
      ];

      await fetch(`https://api.telegram.org/bot${cleanToken}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commands }),
      });

      // If WebApp URL is provided, set the Menu Button to open Mini App
      if (webAppUrl) {
        await fetch(`https://api.telegram.org/bot${cleanToken}/setChatMenuButton`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menu_button: {
              type: 'web_app',
              text: '📱 Староста 24',
              web_app: { url: webAppUrl },
            },
          }),
        });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Send a real Telegram message using the bot token
   */
  async sendMessage(
    token: string,
    chatId: string,
    text: string,
    options?: { parse_mode?: 'Markdown' | 'HTML'; reply_markup?: any }
  ): Promise<{ success: boolean; error?: string; messageId?: number }> {
    const cleanToken = token.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken || !cleanChatId) {
      return { success: false, error: 'Укажите токен бота и Chat ID (юзернейм или ID чата)' };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text,
          parse_mode: options?.parse_mode || 'Markdown',
          reply_markup: options?.reply_markup,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        return { success: true, messageId: data.result?.message_id };
      } else {
        return { success: false, error: data.description || 'Не удалось отправить сообщение' };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Сетевая ошибка при отправке в Telegram' };
    }
  },

  /**
   * Generates formatted command responses replicating full app features inside Telegram
   */
  generateCommandResponse(
    command: string,
    context: {
      groupMeta: any;
      starostaUser: any;
      starostaMandate: any;
      students: any[];
      todayClasses: any[];
      currentPairRecord: any;
      homework: any[];
      poll?: any;
    }
  ): { text: string; buttons?: { text: string; callback_data?: string; url?: string }[][] } {
    const {
      groupMeta,
      starostaUser,
      starostaMandate,
      students,
      todayClasses,
      currentPairRecord,
      homework,
      poll,
    } = context;

    switch (command.toLowerCase()) {
      case '/start':
      case 'start':
        return {
          text:
            `👋 *Добро пожаловать в Telegram-бота «Староста 24»!*\n\n` +
            `🎓 *Группа:* \`${groupMeta.code}\` (${groupMeta.faculty})\n` +
            `👑 *Староста:* ${starostaUser.name} (${starostaUser.username})\n` +
            `🛡️ *Мандат:* ${starostaMandate.isSigned ? '✅ Официально утвержден' : 'Ожидает подписи'}\n\n` +
            `Бот автоматизирует старостат, учет посещаемости, расписание и связь с деканатом.\n\n` +
            `Выберите команду из меню ниже или нажмите на кнопку для запуска приложения!`,
          buttons: [
            [
              { text: '📋 Журнал посещаемости', callback_data: '/journal' },
              { text: '📅 Расписание пар', callback_data: '/schedule' },
            ],
            [
              { text: '📝 Домашние задания', callback_data: '/homework' },
              { text: '🗳️ Опрос группы', callback_data: '/poll' },
            ],
            [
              { text: '🛡️ Профиль старосты', callback_data: '/starosta' },
            ],
          ],
        };

      case '/journal':
      case 'journal': {
        const records = currentPairRecord.records || {};
        const presentCount = students.filter(
          (s) => records[s.id] === 'present' || records[s.id] === 'late' || !records[s.id]
        ).length;
        const absentList = students
          .filter((s) => records[s.id] === 'absent')
          .map((s) => s.name)
          .join(', ') || 'нет';
        const excusedList = students
          .filter((s) => records[s.id] === 'excused')
          .map((s) => `${s.name} (справка)`)
          .join(', ') || 'нет';
        const percent = Math.round((presentCount / (students.length || 1)) * 100);

        return {
          text:
            `📋 *РАПОРТИЧКА ПОСЕЩАЕМОСТИ — ГРУППА ${groupMeta.code}*\n\n` +
            `📅 *Дата:* ${currentPairRecord.date} | Пара №${currentPairRecord.pairNumber}\n` +
            `📚 *Предмет:* ${currentPairRecord.subject}\n\n` +
            `👥 *Всего студентов:* ${students.length}\n` +
            `✅ *Присутствуют:* ${presentCount} (${percent}%)\n` +
            `❌ *Отсутствуют (н/б):* ${absentList}\n` +
            `📝 *По уважительной:* ${excusedList}\n\n` +
            `_Подписано старостой: ${starostaMandate.signatureText || starostaUser.name}_`,
          buttons: [
            [
              { text: '✅ Отметить всех присутствующими', callback_data: 'mark_all' },
            ],
            [
              { text: '🔄 Обновить рапортичку', callback_data: '/journal' },
            ],
          ],
        };
      }

      case '/schedule':
      case 'schedule':
      case '/schedule 1':
      case '/schedule 2': {
        const isSg1 = command.includes('1');
        const isSg2 = command.includes('2');
        const filtered = todayClasses.filter((c) => {
          if (isSg1) return c.subgroup === 1 || !c.subgroup;
          if (isSg2) return c.subgroup === 2 || !c.subgroup;
          return true;
        });

        const classesText =
          filtered.length > 0
            ? filtered
                .map((c, idx) => {
                  const sgLabel = c.subgroup ? ` [${c.subgroup} п/гр]` : ' [Общая]';
                  return (
                    `*${c.pairNumber} пара* (\`${c.timeStart} – ${c.timeEnd}\`)${sgLabel}\n` +
                    `📖 *${c.subject}*\n` +
                    `👨‍🏫 ${c.teacher} • 🚪 ${c.auditorium}` +
                    (idx === 0 ? '  _● Идет сейчас_' : '')
                  );
                })
                .join('\n\n')
            : '🎉 Сегодня занятий в расписании нет!';

        const subTitle = isSg1 ? ' (1-я подгруппа)' : isSg2 ? ' (2-я подгруппа)' : ' (Все подгруппы 1/2)';

        return {
          text:
            `📅 *РАСПИСАНИЕ ЗАНЯТИЙ — РУК КРАСНОДАР 2026*\n` +
            `🎓 *Группа:* \`${groupMeta.code}\`${subTitle}\n` +
            `🏛️ ${groupMeta.university}\n` +
            `🔗 Источник: [schedule.ruc.su](https://schedule.ruc.su/?ysclid=mw43l57l8d43423857)\n\n` +
            `${classesText}\n\n` +
            `_Синхронизировано с schedule.ruc.su_`,
          buttons: [
            [
              { text: '1️⃣ 1 п/гр (Дмитрий)', callback_data: '/schedule 1' },
              { text: '2️⃣ 2 п/гр (Анна)', callback_data: '/schedule 2' },
            ],
            [
              { text: '🔄 Все пары на сегодня', callback_data: '/schedule' },
              { text: '🌐 Открыть schedule.ruc.su', url: 'https://schedule.ruc.su/?ysclid=mw43l57l8d43423857' },
            ],
          ],
        };
      }

      case '/homework':
      case 'homework': {
        const hwText =
          homework.length > 0
            ? homework
                .map(
                  (h) =>
                    `📌 *${h.subject}*: ${h.title}\n` +
                    `⏱️ Срок сдачи: \`${h.deadline}\` • Сдали: ${h.completedByUserIds.length} чел.`
                )
                .join('\n\n')
            : '✅ Все задания и лабораторные сданы!';

        return {
          text:
            `📝 *АКТУАЛЬНЫЕ ДОМАШНИЕ ЗАДАНИЯ И ДЕДЛАЙНЫ*\n\n` +
            `${hwText}\n\n` +
            `Не забудьте отметить сданные работы в личном кабинете!`,
          buttons: [
            [{ text: '🔄 Обновить дедлайны', callback_data: '/homework' }],
          ],
        };
      }

      case '/starosta':
      case 'starosta':
        return {
          text:
            `👑 *СТАРОСТАТ ГРУППЫ ${groupMeta.code}*\n` +
            `🏛️ ${groupMeta.university} (Краснодарский край, 2026)\n\n` +
            `👤 *Староста 1-й подгруппы:* Дмитрий Дунаев\n` +
            `💬 Telegram: @dima_starosta\n` +
            `📞 Телефон: +7 (999) 234-56-78\n\n` +
            `👤 *Староста 2-й подгруппы:* Анна Сергеева\n` +
            `💬 Telegram: @anya_starosta2\n` +
            `📞 Телефон: +7 (916) 345-67-89\n\n` +
            `🛡️ *Мандат:* ${starostaMandate.isSigned ? 'Утвержден ректоратом' : 'Не подписан'}\n` +
            `✍️ *Подписи:* \`${starostaMandate.signatureText || 'Дунаев Д.С. и Сергеева А.В.'}\`\n` +
            `📜 *Приказ:* ${starostaMandate.orderNumber || 'Приказ ККИ РУК №84-СТ/2026'}\n` +
            `⏳ *Период:* ${starostaMandate.term}\n\n` +
            `Оба старосты имеют полномочия подавать рапортички в деканат и синхронизировать расписание через schedule.ruc.su.`,
          buttons: [
            [
              { text: '✉️ Староста 1 п/гр (Дмитрий)', url: 'https://t.me/dima_starosta' },
              { text: '✉️ Староста 2 п/гр (Анна)', url: 'https://t.me/anya_starosta2' },
            ],
          ],
        };

      case '/poll':
      case 'poll':
        if (!poll) {
          return { text: 'В настоящий момент активных опросов в группе нет.' };
        }
        return {
          text:
            `🗳️ *ОПРОС ГРУППЫ ${groupMeta.code}*\n\n` +
            `❓ *Вопрос:* ${poll.question}\n\n` +
            poll.options
              .map((o: any, i: number) => `${i + 1}. ${o.text} — *${o.votedUserIds.length}* гол.`)
              .join('\n'),
          buttons: poll.options.map((o: any) => [
            { text: `👉 ${o.text}`, callback_data: `vote_${o.id}` },
          ]),
        };

      default:
        return {
          text:
            `❓ Неизвестная команда. Доступные команды:\n` +
            `/start — главное меню\n` +
            `/journal — журнал посещаемости\n` +
            `/schedule — расписание пар\n` +
            `/homework — домашние задания\n` +
            `/starosta — контакты старосты\n` +
            `/poll — опрос группы`,
        };
    }
  },
};
