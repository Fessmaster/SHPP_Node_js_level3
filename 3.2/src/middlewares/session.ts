import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import { Pool } from 'mysql2/promise';

const MySQLSession = MySQLStore(session);

export async function createSession(pool: Pool) {
  const SESSION_LIFETIME = 86400;
  const secretKey = process.env.SESSION_SECRET;

  if (!secretKey) {
    throw new Error("Can't read secretKey!")
  }

  //init MySQL storage
  const sessionStore = new MySQLSession({
    expiration: SESSION_LIFETIME*1000,
    createDatabaseTable: true,
    schema: {
      tableName: 'session',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data'
      }
    }
  }, pool as any)

  return session({
    secret: secretKey,
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      maxAge: SESSION_LIFETIME * 1000
    }
  });
}