const notifier = require('node-notifier');

/**
 * Парсит строку длительности вида "1h 5m 10s" (часы, минуты, секунды).
 * Фрагменты можно указывать в любом порядке, пробелы допускаются.
 * @param {string} input
 * @returns {number} длительность в миллисекундах
 */
function parseDurationString(input) {
  const trimmed = input.trim();
  if (!trimmed) {
    return NaN;
  }

  const pattern = /(\d+)\s*([hms])/gi;
  let totalMs = 0;
  let matched = false;
  let match;

  while ((match = pattern.exec(trimmed)) !== null) {
    matched = true;
    const value = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (unit === 'h') {
      totalMs += value * 60 * 60 * 1000;
    } else if (unit === 'm') {
      totalMs += value * 60 * 1000;
    } else if (unit === 's') {
      totalMs += value * 1000;
    }
  }

  if (!matched || totalMs <= 0) {
    return NaN;
  }

  // Проверка: вся строка должна состоять только из допустимых токенов
  const withoutMatches = trimmed.replace(pattern, '').replace(/\s+/g, '');
  if (withoutMatches.length > 0) {
    return NaN;
  }

  return totalMs;
}

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts = [];
  if (h > 0) parts.push(`${h} ч`);
  if (m > 0) parts.push(`${m} мин`);
  if (s > 0 || parts.length === 0) parts.push(`${s} с`);
  return parts.join(' ');
}

function sendTimerNotification(durationText) {
  return new Promise((resolve) => {
    notifier.notify(
      {
        title: 'Таймер завершён',
        message: `Прошло ${durationText}.`,
        sound: true,
        wait: false,
      },
      (error) => {
        if (error) {
          console.error(
            `Не удалось отправить системное уведомление: ${error.message}`,
          );
        }
        resolve();
      },
    );
  });
}

const rawArgs = process.argv.slice(2);
if (rawArgs.length === 0) {
  console.error(
    'Использование: node index.js <длительность>\n' +
      'Пример: node index.js "1h 5m 10s"\n' +
      'Или:    node index.js 1h 5m 10s',
  );
  process.exit(1);
}

const input = rawArgs.join(' ');
const durationMs = parseDurationString(input);

if (Number.isNaN(durationMs)) {
  console.error(
    'Укажите длительность в формате: 1h 5m 10s (часы h, минуты m, секунды s).',
  );
  process.exit(1);
}

const durationText = formatDuration(durationMs);

console.log(`Таймер установлен на ${durationText}.`);

setTimeout(async () => {
  process.stdout.write('\x07');
  console.log('Время вышло! Таймер завершён.');
  await sendTimerNotification(durationText);
}, durationMs);
