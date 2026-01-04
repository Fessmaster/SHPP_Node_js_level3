import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: 'library',
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  waitForConnections: true,
  queueLimit: 50,
  multipleStatements: true,
  charset: 'utf8mb4'
})