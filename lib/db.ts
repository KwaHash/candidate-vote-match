import mysql, { type Connection } from 'mysql2/promise'

export async function withDatabase<T>(
  callback: (db: Connection) => Promise<T>
): Promise<T> {
  let db: Connection | null = null

  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST as string,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
    })

    await initializeDatabase(db)

    return await callback(db)
  } catch (error) {
    console.error('DB ERROR: ', error)
    throw error
  } finally {
    // Ensure the connection is always closed
    if (db) {
      await db.end()
    }
  }
}

async function initializeDatabase(db: Connection) {
  // candidates
  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // email verification tokens
  await db.execute(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL
    )
  `)

  // politicians
  await db.execute(`
    CREATE TABLE IF NOT EXISTS politicians (
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      party VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      avatar VARCHAR(255),
      birth_year INT,
      gender VARCHAR(255),
      website VARCHAR(255),
      facebook VARCHAR(255),
      twitter VARCHAR(255),
      youtube VARCHAR(255),
      line VARCHAR(255),
      instagram VARCHAR(255),
      tiktok VARCHAR(255),
      linkedin VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // representatives2026 candidates
  await db.execute(`
    CREATE TABLE IF NOT EXISTS representatives2026 (
      kanji_name VARCHAR(255),
      hiragana_name VARCHAR(255),
      party VARCHAR(255),
      district VARCHAR(255),
      proportional VARCHAR(255),
      shu_count INT,
      san_count INT,
      birth_date VARCHAR(255),
      avatar VARCHAR(255),
      title VARCHAR(255),
      biography TEXT,
      origin VARCHAR(255),
      shin VARCHAR(255),
      questions_answers JSON
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      candidate_id INT NOT NULL UNIQUE,
      kanji_name VARCHAR(255) NOT NULL,
      hiragana_name VARCHAR(255) NOT NULL,
      party VARCHAR(255) NOT NULL,
      birth_date VARCHAR(255) NOT NULL,
      avatar MEDIUMTEXT NOT NULL,
      title VARCHAR(255),
      origin VARCHAR(255),
      biography TEXT,
      question_answers JSON,
      website JSON,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS resources (
      id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
      provider_type VARCHAR(64) NOT NULL,
      provider_name VARCHAR(255) NOT NULL,
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(64),
      prefecture VARCHAR(64) NOT NULL,
      municipality VARCHAR(255),
      content TEXT NOT NULL,
      price_type VARCHAR(64) NOT NULL,
      availability VARCHAR(64) NOT NULL,
      coverage_area JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}