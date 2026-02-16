CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  published_year INT,
  pages_count INT,
  isbn VARCHAR(50),
  img VARCHAR(255),
  about TEXT,
  views INT DEFAULT 0,
  orders INT DEFAULT 0,
  delete_at TIMESTAMP DEFAULT NULL
);