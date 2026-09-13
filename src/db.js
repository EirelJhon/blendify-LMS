import initSqlJs from 'sql.js';

const DB_STORAGE_KEY = 'blendify_sqlite_db_v1';
let dbInstance = null;
let initPromise = null;

// Helper to convert Uint8Array to Base64 and vice versa for persistent storage
function uint8ArrayToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

/**
 * Persist SQLite database to browser storage
 */
export function persistDatabase() {
  if (!dbInstance) return;
  try {
    const binary = dbInstance.export();
    const b64 = uint8ArrayToBase64(binary);
    localStorage.setItem(DB_STORAGE_KEY, b64);
  } catch (e) {
    console.warn('[SQLite] Failed to persist database:', e);
  }
}

/**
 * Export raw SQLite database as a downloadable .sqlite file
 */
export function downloadDatabaseFile(filename = 'blendify.sqlite') {
  if (!dbInstance) {
    console.error('[SQLite] Database not initialized.');
    return;
  }
  persistDatabase();
  const binary = dbInstance.export();
  const blob = new Blob([binary], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Initialize SQLite WebAssembly and create/restore relational tables
 */
export async function getDatabase() {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: file => {
        if (typeof window !== 'undefined' && window.location && window.location.origin) {
          // Robust origin-based resolution for localhost, Netlify, Vercel, or custom domains
          const base = import.meta.env.BASE_URL || '/';
          return new URL(`${base}${file}`.replace('//', '/'), window.location.href).href;
        }
        return `/${file}`;
      }
    });

    let savedBinary = null;
    try {
      const savedB64 = localStorage.getItem(DB_STORAGE_KEY);
      if (savedB64) {
        savedBinary = base64ToUint8Array(savedB64);
      }
    } catch (e) {
      console.warn('[SQLite] Could not load saved database, creating new one.', e);
    }

    if (savedBinary) {
      try {
        dbInstance = new SQL.Database(savedBinary);
        console.log('[SQLite] Restored existing SQLite database from local storage.');
      } catch (err) {
        console.warn('[SQLite] Corrupted database state, creating clean database:', err);
        dbInstance = new SQL.Database();
      }
    } else {
      dbInstance = new SQL.Database();
      console.log('[SQLite] Initializing new SQLite database.');
    }

    // Initialize Schema
    initSchema(dbInstance);
    // Seed initial records if empty
    seedInitialData(dbInstance);
    // Save state
    persistDatabase();

    return dbInstance;
  })();

  return initPromise;
}

/**
 * Execute DDL statements
 */
function initSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classroom_portals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      instructor TEXT NOT NULL,
      members_count INTEGER DEFAULT 1,
      category TEXT DEFAULT 'UI/UX',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS learning_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      author TEXT NOT NULL,
      date_uploaded TEXT NOT NULL,
      file_size TEXT NOT NULL,
      file_type TEXT NOT NULL,
      badge_class TEXT NOT NULL,
      downloads_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portal_tag TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      deadline TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      action TEXT NOT NULL,
      portal_tag TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);
}

/**
 * Seed initial records into SQLite tables
 */
function seedInitialData(db) {
  // Seed Users
  const userCount = db.exec("SELECT COUNT(*) as count FROM users")[0]?.values[0][0] || 0;
  if (userCount === 0) {
    const stmt = db.prepare("INSERT INTO users (email, name, role) VALUES (?, ?, ?)");
    stmt.run(['alex.student@gmail.com', 'Alex Rivers', 'student']);
    stmt.run(['harsh.teacher@blendify.edu', 'Harsh Vardhan', 'teacher']);
    stmt.run(['elena.design@gmail.com', 'Elena Rostova', 'teacher']);
    stmt.free();
  }

  // Seed Portals
  const portalCount = db.exec("SELECT COUNT(*) as count FROM classroom_portals")[0]?.values[0][0] || 0;
  if (portalCount === 0) {
    const stmt = db.prepare("INSERT INTO classroom_portals (tag, title, instructor, members_count, category) VALUES (?, ?, ?, ?, ?)");
    stmt.run(['#PORTAL-FIGMA-101', 'UI/UX Cohort 4 — Webflow Breakpoints Lab', 'Vativa Hub · UI/UX Design', 28, 'UI/UX']);
    stmt.run(['#WEBFLOW-LAB-44', 'Webflow Interactions & CMS Masterclass', 'Elena Rostova', 34, 'Webflow']);
    stmt.run(['#STUDY-ROOM-B', 'Product Design Sprint & Design Tokens', 'Design Guild', 19, 'Design Tokens']);
    stmt.run(['#TOKENS-DEV-99', 'Frontend Responsive Typography & Spacing', 'Sarah Chen', 15, 'Typography']);
    stmt.free();
  }

  // Seed Learning Materials
  const matCount = db.exec("SELECT COUNT(*) as count FROM learning_materials")[0]?.values[0][0] || 0;
  if (matCount === 0) {
    const stmt = db.prepare(`
      INSERT INTO learning_materials 
      (title, category, author, date_uploaded, file_size, file_type, badge_class, downloads_count) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const initialMaterials = [
      ['Figma Responsive Auto-Layout Breakpoint Kit', 'UI Design', 'Alex R. (Student)', 'Sep 08, 2026', '14.2 MB', 'FIG', 'badge-figma', 42],
      ['Webflow Fluid Responsive CSS Clamping Reference Sheet', 'Webflow', 'Kavita M. (Mentor)', 'Sep 06, 2026', '2.8 MB', 'PDF', 'badge-pdf', 89],
      ['Mobile-First Design System Starter Tokens (JSON & CSS)', 'Tokens', 'Design Guild', 'Sep 04, 2026', '4.1 MB', 'ZIP', 'badge-zip', 56],
      ['Interactive Mobile Navbar Navigation Component Code', 'Components', 'Elena R. (Instructor)', 'Sep 02, 2026', '620 KB', 'JS / HTML', 'badge-code', 118],
      ['Complete Cohort 4 Typography & Spacing Guidelines', 'Typography', 'Sarah Chen', 'Aug 29, 2026', '8.4 MB', 'PDF', 'badge-pdf', 67],
      ['Wireframe Flowchart Kits for Multi-Device UX', 'Wireframing', 'Devon Vance', 'Aug 26, 2026', '18.9 MB', 'FIG', 'badge-figma', 93]
    ];
    for (const mat of initialMaterials) {
      stmt.run(mat);
    }
    stmt.free();
  }

  // Seed Quizzes
  const quizCount = db.exec("SELECT COUNT(*) as count FROM quizzes")[0]?.values[0][0] || 0;
  if (quizCount === 0) {
    const stmt = db.prepare("INSERT INTO quizzes (portal_tag, title, type, deadline, status) VALUES (?, ?, ?, ?, ?)");
    stmt.run(['#PORTAL-FIGMA-101', 'Auto-Layout & Hug vs Fill Quiz', 'Multiple Choice', 'Sep 15, 2026', 'Active']);
    stmt.run(['#PORTAL-FIGMA-101', 'Responsive Breakpoint Practical Lab', 'Design Submission', 'Sep 18, 2026', 'Active']);
    stmt.free();
  }

  // Seed Activities
  const actCount = db.exec("SELECT COUNT(*) as count FROM student_activities")[0]?.values[0][0] || 0;
  if (actCount === 0) {
    const stmt = db.prepare("INSERT INTO student_activities (student_name, action, portal_tag, timestamp) VALUES (?, ?, ?, ?)");
    stmt.run(['Alex Rivers', 'Downloaded Breakpoint Kit', '#PORTAL-FIGMA-101', '10 mins ago']);
    stmt.run(['Marcus Brody', 'Completed Module 1: Layout Fundamentals', '#PORTAL-FIGMA-101', '35 mins ago']);
    stmt.run(['Sophia Li', 'Submitted Design Tokens Assignment', '#PORTAL-FIGMA-101', '1 hour ago']);
    stmt.free();
  }
}

// =========================================================================
// QUERY HELPERS
// =========================================================================

export async function sqlQueryAll(sql, params = []) {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export async function sqlQueryOne(sql, params = []) {
  const rows = await sqlQueryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function sqlRun(sql, params = []) {
  const db = await getDatabase();
  db.run(sql, params);
  persistDatabase();
}

// =========================================================================
// REPOSITORY APIS
// =========================================================================

// --- Users & Roles ---
export async function getAccountRolesMap() {
  const users = await sqlQueryAll("SELECT email, role FROM users");
  const map = {};
  for (const u of users) {
    map[u.email.toLowerCase()] = u.role;
  }
  return map;
}

export async function getUserByEmail(email) {
  if (!email) return null;
  return await sqlQueryOne("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [email.trim()]);
}

export async function saveUserRole(email, role, name = null) {
  if (!email || !role) return;
  const existing = await getUserByEmail(email);
  if (existing) {
    await sqlRun("UPDATE users SET role = ?, name = COALESCE(?, name) WHERE id = ?", [role, name, existing.id]);
  } else {
    const userName = name || email.split('@')[0];
    await sqlRun("INSERT INTO users (email, name, role) VALUES (?, ?, ?)", [email.trim(), userName, role]);
  }
}

// --- Classroom Portals ---
export async function getJoinedPortals() {
  return await sqlQueryAll("SELECT * FROM classroom_portals ORDER BY id DESC");
}

export async function addJoinedPortal(tag, title, instructor = 'Community Class', membersCount = 1, category = 'General') {
  const existing = await sqlQueryOne("SELECT * FROM classroom_portals WHERE UPPER(tag) = UPPER(?)", [tag.trim()]);
  if (!existing) {
    await sqlRun(
      "INSERT INTO classroom_portals (tag, title, instructor, members_count, category) VALUES (?, ?, ?, ?, ?)",
      [tag.trim(), title, instructor, membersCount, category]
    );
  }
  return await getJoinedPortals();
}

// --- Learning Materials ---
export async function getMaterials(searchQuery = '', category = 'all') {
  let sql = "SELECT * FROM learning_materials WHERE 1=1";
  const params = [];

  if (category && category !== 'all') {
    sql += " AND (LOWER(category) LIKE ? OR LOWER(title) LIKE ?)";
    params.push(`%${category.toLowerCase()}%`, `%${category.toLowerCase()}%`);
  }

  if (searchQuery && searchQuery.trim()) {
    sql += " AND (LOWER(title) LIKE ? OR LOWER(category) LIKE ? OR LOWER(author) LIKE ?)";
    const term = `%${searchQuery.trim().toLowerCase()}%`;
    params.push(term, term, term);
  }

  sql += " ORDER BY id DESC";
  return await sqlQueryAll(sql, params);
}

export async function addMaterial({ title, category, author, fileSize, fileType, badgeClass }) {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  await sqlRun(
    `INSERT INTO learning_materials (title, category, author, date_uploaded, file_size, file_type, badge_class, downloads_count) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [title, category, author, dateStr, fileSize, fileType, badgeClass]
  );
  return await getMaterials();
}

export async function incrementMaterialDownload(id) {
  await sqlRun("UPDATE learning_materials SET downloads_count = downloads_count + 1 WHERE id = ?", [id]);
}

// --- Quizzes & Activities ---
export async function getQuizzes(portalTag = null) {
  if (portalTag) {
    return await sqlQueryAll("SELECT * FROM quizzes WHERE portal_tag = ? ORDER BY id DESC", [portalTag]);
  }
  return await sqlQueryAll("SELECT * FROM quizzes ORDER BY id DESC");
}

export async function addQuiz({ portalTag, title, type, deadline }) {
  await sqlRun(
    "INSERT INTO quizzes (portal_tag, title, type, deadline, status) VALUES (?, ?, ?, ?, 'Active')",
    [portalTag, title, type, deadline]
  );
  return await getQuizzes();
}

export async function getActivities() {
  return await sqlQueryAll("SELECT * FROM student_activities ORDER BY id DESC LIMIT 20");
}

export async function addActivity({ studentName, action, portalTag }) {
  await sqlRun(
    "INSERT INTO student_activities (student_name, action, portal_tag, timestamp) VALUES (?, ?, ?, 'Just now')",
    [studentName, action, portalTag]
  );
  return await getActivities();
}

/**
 * Execute raw SQL query from the Interactive Explorer
 * Returns { success, columns, values, rowCount, timeMs } or { success: false, error, timeMs }
 */
export async function executeRawSql(sql) {
  const db = await getDatabase();
  const startTime = performance.now();
  try {
    const trimmed = (sql || '').trim();
    if (!trimmed) {
      return { success: false, error: 'Query string is empty.' };
    }
    const results = db.exec(trimmed);
    const timeMs = (performance.now() - startTime).toFixed(2);
    persistDatabase();

    if (!results || results.length === 0) {
      return {
        success: true,
        columns: ['Result'],
        values: [['Command executed successfully (no result set).']],
        rowCount: 0,
        timeMs
      };
    }

    const firstResult = results[0];
    return {
      success: true,
      columns: firstResult.columns,
      values: firstResult.values,
      rowCount: firstResult.values.length,
      timeMs
    };
  } catch (err) {
    const timeMs = (performance.now() - startTime).toFixed(2);
    return {
      success: false,
      error: err.message || String(err),
      timeMs
    };
  }
}

/**
 * Get row counts for all database tables
 */
export async function getTableStats() {
  const db = await getDatabase();
  const tables = ['users', 'classroom_portals', 'learning_materials', 'quizzes', 'student_activities'];
  const stats = {};
  for (const t of tables) {
    try {
      const res = db.exec(`SELECT COUNT(*) as count FROM ${t}`);
      stats[t] = res[0]?.values[0][0] || 0;
    } catch {
      stats[t] = 0;
    }
  }
  return stats;
}

/**
 * Reset database to fresh seed data
 */
export async function resetDatabaseToSeed() {
  const db = await getDatabase();
  db.run(`
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS classroom_portals;
    DROP TABLE IF EXISTS learning_materials;
    DROP TABLE IF EXISTS quizzes;
    DROP TABLE IF EXISTS student_activities;
  `);
  initSchema(db);
  seedInitialData(db);
  persistDatabase();
  return await getTableStats();
}
