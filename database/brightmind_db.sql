CREATE DATABASE IF NOT EXISTS brightmind_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE brightmind_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'user') NOT NULL DEFAULT 'user',
  is_locked TINYINT(1) NOT NULL DEFAULT 0,
  auth_provider ENUM('local', 'google') NOT NULL DEFAULT 'local',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(64) PRIMARY KEY,
  author_email VARCHAR(190) NOT NULL,
  category VARCHAR(80) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_date VARCHAR(60) NOT NULL,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_posts_author_email (author_email),
  INDEX idx_blog_posts_deleted (is_deleted)
);

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  course VARCHAR(190) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reviews_email (email),
  INDEX idx_reviews_deleted (is_deleted)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  user_email VARCHAR(190) NOT NULL,
  role ENUM('admin', 'staff', 'user') NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_auth_sessions_user_email (user_email),
  INDEX idx_auth_sessions_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  child_birth_date DATE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password_hash, role, is_locked, auth_provider)
VALUES ('Admin Demo', 'admin@brightmind.local', 'demo123', 'admin', 0, 'local')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role),
  is_locked = VALUES(is_locked),
  auth_provider = VALUES(auth_provider);
