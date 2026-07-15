CREATE DATABASE IF NOT EXISTS kiabasso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kiabasso;

CREATE TABLE IF NOT EXISTS users (
  id                VARCHAR(36) PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  email             VARCHAR(100) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  phone             VARCHAR(20) UNIQUE,
  avatar_url        VARCHAR(500),
  verified          BOOLEAN DEFAULT false,
  verification_method VARCHAR(20),
  rating            DECIMAL(3,2) DEFAULT 0,
  total_sales       INTEGER DEFAULT 0,
  total_ads         INTEGER DEFAULT 0,
  location          VARCHAR(100),
  bio               TEXT,
  status            VARCHAR(20) DEFAULT 'active',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login        TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS ads (
  id               VARCHAR(36) PRIMARY KEY,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  price            DECIMAL(15,2),
  category         VARCHAR(50) NOT NULL,
  subcategory      VARCHAR(50),
  location         VARCHAR(100),
  `condition`      VARCHAR(20),
  user_id          VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  status           VARCHAR(20) DEFAULT 'active',
  is_featured      BOOLEAN DEFAULT false,
  promotion_level  VARCHAR(20) DEFAULT 'free',
  views            INTEGER DEFAULT 0,
  favorites        INTEGER DEFAULT 0,
  images           JSON,
  expires_at       TIMESTAMP NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ads_user_id (user_id),
  INDEX idx_ads_category (category),
  INDEX idx_ads_status (status),
  INDEX idx_ads_location (location)
);

CREATE TABLE IF NOT EXISTS wallets (
  id                VARCHAR(36) PRIMARY KEY,
  user_id           VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  available_balance DECIMAL(15,2) DEFAULT 0,
  blocked_balance   DECIMAL(15,2) DEFAULT 0,
  total_balance     DECIMAL(15,2) DEFAULT 0,
  currency          VARCHAR(10) DEFAULT 'AOA',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id           VARCHAR(36) PRIMARY KEY,
  wallet_id    VARCHAR(36) REFERENCES wallets(id) ON DELETE CASCADE,
  type         VARCHAR(30) NOT NULL,
  amount       DECIMAL(15,2) NOT NULL,
  fee_amount   DECIMAL(15,2) DEFAULT 0,
  description  VARCHAR(500),
  reference    VARCHAR(100) UNIQUE,
  status       VARCHAR(20) DEFAULT 'completed',
  metadata     JSON,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transactions_wallet (wallet_id),
  INDEX idx_transactions_type (type),
  INDEX idx_transactions_created (created_at)
);

CREATE TABLE IF NOT EXISTS orders (
  id               VARCHAR(36) PRIMARY KEY,
  ad_id            VARCHAR(36) REFERENCES ads(id),
  buyer_id         VARCHAR(36) REFERENCES users(id),
  seller_id        VARCHAR(36) REFERENCES users(id),
  amount           DECIMAL(15,2) NOT NULL,
  fee_amount       DECIMAL(15,2) DEFAULT 0,
  status           VARCHAR(30) DEFAULT 'pending',
  tracking_code    VARCHAR(100),
  buyer_confirmed  BOOLEAN DEFAULT false,
  seller_confirmed BOOLEAN DEFAULT false,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_buyer (buyer_id),
  INDEX idx_orders_seller (seller_id),
  INDEX idx_orders_status (status)
);

CREATE TABLE IF NOT EXISTS disputes (
  id           VARCHAR(36) PRIMARY KEY,
  order_id     VARCHAR(36) REFERENCES orders(id),
  opened_by    VARCHAR(36) REFERENCES users(id),
  reason       VARCHAR(50) NOT NULL,
  description  TEXT,
  evidence     JSON,
  status       VARCHAR(20) DEFAULT 'open',
  resolution   VARCHAR(50),
  resolved_by  VARCHAR(36) REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_disputes_order (order_id),
  INDEX idx_disputes_status (status)
);

CREATE TABLE IF NOT EXISTS promotions (
  id            VARCHAR(36) PRIMARY KEY,
  ad_id         VARCHAR(36) REFERENCES ads(id),
  user_id       VARCHAR(36) REFERENCES users(id),
  plan          VARCHAR(20) NOT NULL,
  price         DECIMAL(15,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date      TIMESTAMP NULL,
  status        VARCHAR(20) DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_promotions_user (user_id),
  INDEX idx_promotions_ad (ad_id),
  INDEX idx_promotions_status (status)
);

CREATE TABLE IF NOT EXISTS messages (
  id           VARCHAR(36) PRIMARY KEY,
  ad_id        VARCHAR(36) REFERENCES ads(id),
  sender_id    VARCHAR(36) REFERENCES users(id),
  receiver_id  VARCHAR(36) REFERENCES users(id),
  content      TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  status       VARCHAR(20) DEFAULT 'sent',
  read_at      TIMESTAMP NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_ad (ad_id),
  INDEX idx_messages_sender (sender_id),
  INDEX idx_messages_receiver (receiver_id),
  INDEX idx_messages_ad_users (ad_id, sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id           VARCHAR(36) PRIMARY KEY,
  order_id     VARCHAR(36) REFERENCES orders(id),
  reviewer_id  VARCHAR(36) REFERENCES users(id),
  reviewed_id  VARCHAR(36) REFERENCES users(id),
  rating       TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reviews_reviewed (reviewed_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id         VARCHAR(36) PRIMARY KEY,
  user_id    VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  ad_id      VARCHAR(36) REFERENCES ads(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, ad_id)
);

ALTER TABLE messages ADD FULLTEXT INDEX ft_messages_content (content);
