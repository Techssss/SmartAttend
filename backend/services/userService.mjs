import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const demoUsers = [
  { id: 'ADMIN001', name: 'Quan tri vien', email: 'admin@smartattend.vn', role: 'admin', password: 'demo123' },
  {
    id: 'TCH001',
    name: 'TS. Nguyen Minh Tuan',
    email: 'teacher@smartattend.vn',
    role: 'teacher',
    department: 'Khoa CNTT',
    password: 'demo123',
  },
  {
    id: 'STU001',
    name: 'Nguyen Van An',
    email: 'student@smartattend.vn',
    role: 'student',
    className: 'CS-301',
    password: 'demo123',
  },
];

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = String(passwordHash).split(':');
  if (!salt || !storedHash) return false;

  const hash = scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, 'hex');
  return stored.length === hash.length && timingSafeEqual(stored, hash);
}

export function publicUser(user) {
  const className = user.className ?? user.class;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    class: className,
    className,
    department: user.department,
    avatar: user.avatar,
  };
}

function dbUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    class: row.class_name ?? row.class,
    className: row.class_name ?? row.class,
    department: row.department,
    avatar: row.avatar,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

function makeUserId(role) {
  const prefix = role === 'teacher' ? 'TCH' : role === 'admin' ? 'ADMIN' : 'STU';
  return `${prefix}${Math.floor(Math.random() * 900000 + 100000)}`;
}

export function validateRegister(input) {
  const role = input.role;
  if (!['teacher', 'student'].includes(role)) return 'Role khong hop le.';
  if (!String(input.name || '').trim()) return 'Ho ten la bat buoc.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(input.email))) return 'Email khong hop le.';
  if (String(input.password || '').length < 6) return 'Mat khau phai co it nhat 6 ky tu.';
  if (role === 'student' && !String(input.className ?? input.class ?? '').trim()) return 'Ma lop la bat buoc.';
  if (role === 'teacher' && !String(input.department || '').trim()) return 'Khoa/bo mon la bat buoc.';
  return '';
}

export function createUserService({ getPool, dataDir }) {
  const usersFile = join(dataDir, 'users.json');

  async function seedDemoUsers() {
    const pool = getPool();
    if (!pool) {
      await readUsers();
      return;
    }

    for (const { password, ...user } of demoUsers) {
      await pool.query(
        `insert into public.app_users (id, name, email, role, class_name, department, avatar, password_hash)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         on conflict (email) do nothing`,
        [
          user.id,
          user.name,
          normalizeEmail(user.email),
          user.role,
          user.className ?? null,
          user.department ?? null,
          user.avatar ?? null,
          hashPassword(password),
        ],
      );
    }
  }

  async function readUsers() {
    const pool = getPool();
    if (pool) {
      const result = await pool.query('select * from public.app_users order by created_at desc');
      return result.rows.map(dbUser);
    }

    try {
      const raw = await readFile(usersFile, 'utf8');
      return JSON.parse(raw);
    } catch {
      await mkdir(dataDir, { recursive: true });
      const seeded = demoUsers.map(({ password, ...user }) => ({
        ...user,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      }));
      await writeFile(usersFile, JSON.stringify(seeded, null, 2));
      return seeded;
    }
  }

  async function writeUsers(users) {
    if (getPool()) return;

    await mkdir(dataDir, { recursive: true });
    await writeFile(usersFile, JSON.stringify(users, null, 2));
  }

  async function findUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    const pool = getPool();

    if (pool) {
      const result = await pool.query('select * from public.app_users where email = $1 limit 1', [normalizedEmail]);
      return result.rows[0] ? dbUser(result.rows[0]) : null;
    }

    const users = await readUsers();
    return users.find((item) => normalizeEmail(item.email) === normalizedEmail) ?? null;
  }

  async function findUserById(id) {
    const pool = getPool();
    if (pool) {
      const result = await pool.query('select * from public.app_users where id = $1 limit 1', [id]);
      return result.rows[0] ? dbUser(result.rows[0]) : null;
    }

    const users = await readUsers();
    return users.find((item) => item.id === id) ?? null;
  }

  async function createUser(input) {
    const role = input.role;
    const className = role === 'student' ? String(input.className ?? input.class ?? '').trim() : undefined;
    const user = {
      id: makeUserId(role),
      name: String(input.name).trim(),
      email: normalizeEmail(input.email),
      role,
      class: className,
      className,
      department: role === 'teacher' ? String(input.department).trim() : undefined,
      passwordHash: hashPassword(String(input.password)),
      createdAt: new Date().toISOString(),
    };
    const pool = getPool();

    if (pool) {
      const result = await pool.query(
        `insert into public.app_users (id, name, email, role, class_name, department, password_hash)
         values ($1, $2, $3, $4, $5, $6, $7)
         returning *`,
        [
          user.id,
          user.name,
          user.email,
          user.role,
          user.className ?? null,
          user.department ?? null,
          user.passwordHash,
        ],
      );
      return dbUser(result.rows[0]);
    }

    const users = await readUsers();
    users.push(user);
    await writeUsers(users);
    return user;
  }

  return {
    seedDemoUsers,
    readUsers,
    writeUsers,
    findUserByEmail,
    findUserById,
    createUser,
  };
}
