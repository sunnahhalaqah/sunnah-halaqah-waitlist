/**
 * Sunnah Halaqah waitlist → Google Sheet.
 * Paste this into the Sheet's Extensions → Apps Script, then deploy as a web app (see README.md).
 */
const SHEET_NAME = 'Waitlist';
const FIELDS = [
  ['Timestamp', null],
  ['Path', 'path'],
  ['Name', 'name'],
  ['Email', 'email'],
  ['WhatsApp', 'whatsapp'],
  ['Country', 'country'],
  ['Brother/Sister', 'gender'],
  ['Wants to learn', 'interests'],
  ['Class type', 'classType'],
  ['Level', 'level'],
  ['Teacher preference', 'teacherPref'],
  ['Teaches', 'teaches'],
  ['Experience', 'experience'],
  ['Qualifications', 'qualifications'],
  ['About', 'about'],
  ['Source', 'source'],
];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return reply_(); // honeypot: bots fill the hidden field
  if (!p.email || !p.name) return reply_();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(FIELDS.map(f => f[0]));
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold');
    }
    sh.appendRow(FIELDS.map(([, key]) => key ? clean_(p[key]) : new Date()));
  } finally {
    lock.releaseLock();
  }
  return reply_();
}

function doGet() {
  return ContentService.createTextOutput('Sunnah Halaqah waitlist endpoint is live.');
}

// Trim, cap length, and stop anything that starts like a formula from running in the sheet.
function clean_(v) {
  const s = String(v == null ? '' : v).trim().slice(0, 600);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply_() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
