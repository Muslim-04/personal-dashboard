/**
 * Personal Dashboard — Google Apps Script Web App
 * Принимает POST-запросы от фронтенда (localStorage — источник правды,
 * это только зеркало в Google Таблицу) и пишет/обновляет/удаляет строки
 * в листах Finance, Tasks, Workouts.
 *
 * КАК РАЗВЕРНУТЬ (один раз):
 * 1. Создайте новую Google Таблицу (sheets.new)
 * 2. Меню: Расширения → Apps Script
 * 3. Удалите содержимое Code.gs, вставьте этот файл целиком
 * 4. Сохраните (Ctrl+S)
 * 5. «Развернуть» → «Новое развёртывание»
 *    Тип: «Веб-приложение»
 *    Выполнять как: «Я» (ваш аккаунт)
 *    Кто имеет доступ: «Все»
 * 6. Нажмите «Развернуть», подтвердите доступ (Advanced → Go to... unsafe → Allow)
 * 7. Скопируйте URL веб-приложения (заканчивается на /exec)
 * 8. Вставьте его в .env.local приложения:
 *      NEXT_PUBLIC_SHEETS_WEBHOOK_URL=<вставленный URL>
 *      NEXT_PUBLIC_SHEETS_TOKEN=personal-dashboard-secret-2024
 *
 * Листы Finance / Tasks / Workouts создаются автоматически при первой
 * записи — ничего вручную создавать не нужно.
 */

var SECRET_TOKEN = 'personal-dashboard-secret-2024'; // должен совпадать с NEXT_PUBLIC_SHEETS_TOKEN

var SHEETS = {
  Finance: {
    headers: ['id', 'date', 'scope', 'project', 'type', 'category', 'amount', 'comment', 'createdAt'],
    keyCol: 'id',
  },
  Tasks: {
    headers: ['kind', 'id', 'date', 'text', 'deadline', 'priority', 'status', 'completedItemIds', 'createdAt', 'completedAt'],
    keyCol: null, // составной ключ (kind + id/date) — обрабатывается отдельно
  },
  Workouts: {
    headers: ['id', 'date', 'type', 'exercises', 'notes', 'createdAt'],
    keyCol: 'id',
  },
};

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.token !== SECRET_TOKEN) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }

    var sheetName = data.sheet;
    var config = SHEETS[sheetName];
    if (!config) {
      return jsonResponse({ ok: false, error: 'Unknown sheet: ' + sheetName });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(config.headers);
      formatHeaderRow(sheet, config.headers.length);
    }

    if (data.action === 'delete') {
      deleteRow(sheet, config, data);
      return jsonResponse({ ok: true, deleted: true });
    }

    upsertRow(sheet, config, sheetName, data);
    return jsonResponse({ ok: true });

  } catch (err) {
    console.error('doPost error:', err);
    return jsonResponse({ ok: false, error: err.message });
  }
}

// ── Найти строку по ключу и обновить, иначе добавить новую ──────────
function upsertRow(sheet, config, sheetName, data) {
  var row = config.headers.map(function (key) {
    var v = data[key];
    if (v === undefined || v === null) return '';
    if (key === 'exercises' && Array.isArray(v)) {
      return v.map(function (ex) { return ex.name + ' ' + ex.sets + 'x' + ex.reps + (ex.weight ? ' x' + ex.weight + 'kg' : ''); }).join(', ');
    }
    if (key === 'completedItemIds' && Array.isArray(v)) {
      return v.join(',');
    }
    return v;
  });

  var matchRow = findRowIndex(sheet, config, sheetName, data);

  if (matchRow > 0) {
    sheet.getRange(matchRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function deleteRow(sheet, config, data) {
  var matchRow = findRowIndex(sheet, config, data.sheet, data);
  if (matchRow > 0) sheet.deleteRow(matchRow);
}

// Для Finance/Workouts ключ — id. Для Tasks: kind='task' → id, kind='checklist' → date.
function findRowIndex(sheet, config, sheetName, data) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var headers = config.headers;

  var keyCol, keyValue;
  if (sheetName === 'Tasks') {
    if (data.kind === 'checklist') {
      keyCol = 'date';
      keyValue = data.date;
      var kindCol = headers.indexOf('kind') + 1;
      var dateColIdx = headers.indexOf('date') + 1;
      var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
      for (var i = 0; i < values.length; i++) {
        if (values[i][kindCol - 1] === 'checklist' && values[i][dateColIdx - 1] === keyValue) return i + 2;
      }
      return -1;
    }
    keyCol = 'id';
    keyValue = data.id;
  } else {
    keyCol = config.keyCol;
    keyValue = data[keyCol];
  }

  var colIdx = headers.indexOf(keyCol) + 1;
  if (colIdx === 0 || !keyValue) return -1;
  var colValues = sheet.getRange(2, colIdx, lastRow - 1, 1).getValues();
  for (var j = 0; j < colValues.length; j++) {
    if (colValues[j][0] === keyValue) return j + 2;
  }
  return -1;
}

function formatHeaderRow(sheet, colCount) {
  sheet.getRange(1, 1, 1, colCount)
    .setFontWeight('bold')
    .setBackground('#18181b')
    .setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Тесты (запускайте вручную из редактора для отладки) ─────────────
function testFinance() {
  var e = { postData: { contents: JSON.stringify({
    token: SECRET_TOKEN, sheet: 'Finance', action: 'upsert',
    id: 'test-1', date: '2026-09-26', scope: 'business', project: 'OPEN BBQ', type: 'income',
    category: 'Продажи', amount: 150000, comment: 'Тест', createdAt: new Date().toISOString(),
  }) } };
  Logger.log(doPost(e).getContent());
}

function testTask() {
  var e = { postData: { contents: JSON.stringify({
    token: SECRET_TOKEN, sheet: 'Tasks', action: 'upsert', kind: 'task',
    id: 'task-1', text: 'Тестовая задача', deadline: '2026-10-01', priority: 'high',
    status: 'todo', createdAt: new Date().toISOString(),
  }) } };
  Logger.log(doPost(e).getContent());
}

function testWorkout() {
  var e = { postData: { contents: JSON.stringify({
    token: SECRET_TOKEN, sheet: 'Workouts', action: 'upsert',
    id: 'w-1', date: '2026-09-26', type: 'Силовая',
    exercises: [{ name: 'Присед', sets: 3, reps: 10, weight: 60 }],
    notes: 'Тест', createdAt: new Date().toISOString(),
  }) } };
  Logger.log(doPost(e).getContent());
}
