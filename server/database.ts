import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'dealership.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    const isNew = !fs.existsSync(DB_PATH);
    dbInstance = new DatabaseSync(DB_PATH);

    // Apply schema
    const schemaPath = path.join(process.cwd(), 'backend', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      dbInstance.exec(schemaSql);
    }

    // Check if empty or new and apply seed
    const checkVehicles = dbInstance.prepare("SELECT count(*) as count FROM vehicles").get() as { count: number };
    if (checkVehicles.count === 0) {
      const seedPath = path.join(process.cwd(), 'backend', 'database', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf-8');
        dbInstance.exec(seedSql);
      }
    }
  }
  return dbInstance;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
