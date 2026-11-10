/**
 * Sunnah Halaqah waitlist → Google Sheet.
 * Paste this into the Sheet's Extensions → Apps Script, then deploy as a web app (see README.md).
 *
 * The page sends two posts:
 *   stage=join     step 1: path, name, email, WhatsApp, source → a new row
 *   stage=details  step 2 (optional): matching answers → filled into that person's row (found by email)
 */
const SHEET_NAME = 'Waitlist';
const FIELDS = [
  ['Joined', null],
  ['Path', 'path'],
  ['Name', 'name'],
  ['Email', 'email'],
  ['WhatsApp', 'whatsapp'],
  ['Source', 'source'],
  ['Brother/Sister', 'gender'],
  ['Country', 'country'],
  ['Wants to learn', 'interests'],
  ['Class type', 'classType'],
  ['Level', 'level'],
  ['Teaches', 'teaches'],
  ['Experience', 'experience'],
  ['Qualifications', 'qualifications'],
  ['About', 'about'],
  ['Details added', null],
];
const DETAIL_KEYS = ['gender', 'country', 'interests', 'classType', 'level', 'teaches', 'experience', 'qualifications', 'about'];

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.website) return reply_();             // honeypot: bots fill the hidden field
  if (!p.email) return reply_();

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    if (p.stage === 'details') {
      const row = findRowByEmail_(sh, p.email);
      if (row) {
        DETAIL_KEYS.forEach(key => sh.getRange(row, col_(key)).setValue(clean_(p[key])));
        sh.getRange(row, FIELDS.length).setValue(new Date());
        return reply_();
      }
      // No step-1 row (rare): fall through and add a full row.
    } else if (!p.name) {
      return reply_();
    }
    sh.appendRow(FIELDS.map(([label, key]) =>
      key ? clean_(p[key]) : (label === 'Joined' ? new Date() : (p.stage === 'details' ? new Date() : ''))));
  } finally {
    lock.releaseLock();
  }
  return reply_();
}

function doGet() {
  return ContentService.createTextOutput('Sunnah Halaqah waitlist endpoint is live.');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(FIELDS.map(f => f[0]));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, FIELDS.length).setFontWeight('bold');
  }
  return sh;
}

function col_(key) {
  return FIELDS.findIndex(f => f[1] === key) + 1;
}

// The newest row with this email (someone may join twice).
function findRowByEmail_(sh, email) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const want = String(email).trim().toLowerCase();
  const emails = sh.getRange(2, col_('email'), last - 1, 1).getValues();
  for (let i = emails.length - 1; i >= 0; i--) {
    if (String(emails[i][0]).trim().toLowerCase() === want) return i + 2;
  }
  return 0;
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
