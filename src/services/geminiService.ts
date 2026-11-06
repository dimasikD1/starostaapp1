import { GoogleGenAI } from '@google/genai';

// Initialize Gemini if an API key is available in process.env or import.meta.env
const apiKey =
  (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
  (import.meta as unknown as { env?: { VITE_GEMINI_API_KEY?: string } }).env?.VITE_GEMINI_API_KEY ||
  '';

let aiInstance: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiInstance = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Gemini init failed:', e);
  }
}

export interface AIGenerateOptions {
  type: 'announcement' | 'excuse_note' | 'deadline_summary' | 'custom';
  prompt: string;
  tone?: 'urgent' | 'friendly' | 'formal';
  groupName?: string;
  context?: string;
}

export async function generateStarostaText(options: AIGenerateOptions): Promise<string> {
  const { type, prompt, tone = 'friendly', groupName = 'ИВТ-22-1' } = options;

  if (aiInstance) {
    try {
      const systemInstruction = `Ты — цифровой помощник старосты академической группы "${groupName}" (сервис "Староста 24").
Твоя задача — формулировать четкие, структурированные и грамотные тексты для студентов или деканата на русском языке.
Используй эмодзи для наглядности, выделяй важное жирным шрифтом и форматируй текст списками.
Стиль общения: ${tone === 'urgent' ? 'срочный и акцентированный' : tone === 'formal' ? 'деловой и официальный' : 'дружелюбный, но авторитетный'}.`;

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to smart local templates:', err);
    }
  }

  // Smart local generation templates if API key is not configured
  await new Promise((resolve) => setTimeout(resolve, 600)); // realistic typing feel

  if (type === 'announcement') {
    if (tone === 'urgent') {
      return `🚨 **СРОЧНО! ВНИМАНИЕ ВСЕЙ ГРУППЕ ${groupName}!** 🚨\n\n` +
        `Уважаемые одногруппники, по поручению деканата и старостата:\n\n` +
        `📌 **Тема:** ${prompt}\n` +
        `⏱️ **Крайний срок (ЖЕСТКИЙ ДЕДЛАЙН):** сегодня до 21:00!\n\n` +
        `Кто не успеет сдать / подтвердить — вопрос будет решаться лично с куратором и замдекана. Не подводите группу!\n\n` +
        `Отпишитесь в комментариях или поставьте реакцию 👍, кто ознакомился.`;
    } else if (tone === 'formal') {
      return `📢 **Информационное сообщение старостата группы ${groupName}**\n\n` +
        `Уважаемые студенты!\n\n` +
        `Довожу до вашего сведения информацию по следующему вопросу:\n` +
        `▸ **${prompt}**\n\n` +
        `Просьба принять к сведению и спланировать учебную нагрузку в соответствии с указанными требованиями.\n` +
        `По всем дополнительным вопросам обращайтесь ко мне в личные сообщения.\n\n` +
        `*С уважением, староста группы Дмитрий Дунаев.*`;
    } else {
      return `👋 **Привет, группа ${groupName}!**\n\n` +
        `Небольшое напоминание для всех нас:\n\n` +
        `✨ **${prompt}**\n\n` +
        `Давайте всё закроем заранее, чтобы спокойно отдохнуть на выходных и не копить долги. Если кому-то нужна помощь с материалами или лабами — пишите в чат, разберемся вместе! 🙌\n\n` +
        `Всем продуктивной недели! 🚀`;
    }
  }

  if (type === 'excuse_note') {
    return `Декану факультета информатики и вычислительной техники\n` +
      `от старосты группы ${groupName}\n` +
      `Дунаева Дмитрия Сергеевича\n\n` +
      `СЗ-РАПОРТИЧКА\n\n` +
      `Довожу до Вашего сведения, что по состоянию на ${new Date().toLocaleDateString('ru-RU')} в группе ${groupName}:\n` +
      `▸ Всего по списку: 10 чел.\n` +
      `▸ Присутствуют на занятиях: 8 чел.\n` +
      `▸ Отсутствуют по уважительной причине (справка/заявление): 1 чел. (Новиков К. — мед. справка №248)\n` +
      `▸ Отсутствуют без уважительной причины: 1 чел. (Васильев А.)\n\n` +
      `Основание: ${prompt || 'Ежедневный учет посещаемости учебных занятий'}.\n\n` +
      `Староста группы ${groupName} ____________ / Дунаев Д.С. /`;
  }

  if (type === 'deadline_summary') {
    return `📋 **Сводка дедлайнов и задач на ближайшую неделю:**\n\n` +
      `1️⃣ **Базы данных (PostgreSQL):** Лаб. №3 (Индексы и триггеры) — дедлайн 8 ноября ⚠️\n` +
      `2️⃣ **Теория вероятностей:** РГР (Доверительные интервалы) — дедлайн 10 ноября 🎯\n` +
      `3️⃣ **Веб-разработка:** REST API микропроект — дедлайн 12 ноября 💻\n` +
      `4️⃣ **Иностранный язык:** Доклад и презентация — дедлайн 15 ноября 🇬🇧\n\n` +
      `💡 *Совет от старосты: сдавайте лабораторные на первых консультациях, чтобы избежать очередей в конце семестра!*`;
  }

  return `🤖 **Ответ цифрового помощника Starosta 24:**\n\n` +
    `По вашему запросу: "${prompt}"\n\n` +
    `Рекомендация для старосты: организуйте опрос в группе с несколькими вариантами времени и закрепите результат в канале объявлений. При необходимости выгрузите электронный отчет из раздела "Журнал".`;
}
