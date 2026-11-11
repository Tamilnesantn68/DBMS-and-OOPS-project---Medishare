-- ============================================================
-- MediShare Database Schema — MySQL 8
-- Flyway Migration: V1__initial_schema.sql
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE users (
  id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  role          ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Organizations ──────────────────────────────────────────
CREATE TABLE organizations (
  id                   BIGINT       AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(255) NOT NULL,
  type                 ENUM('HOSPITAL','PHARMACY','CLINIC','NGO','DISTRIBUTOR','OTHER') NOT NULL,
  registration_number  VARCHAR(100) NOT NULL UNIQUE,
  licence_reference    VARCHAR(100),
  address              VARCHAR(500) NOT NULL,
  city                 VARCHAR(100) NOT NULL,
  state                VARCHAR(50)  NOT NULL,
  zip                  VARCHAR(20)  NOT NULL,
  storage_type         ENUM('AMBIENT','REFRIGERATED','FROZEN','DEEP_FROZEN') NOT NULL DEFAULT 'AMBIENT',
  contact_name         VARCHAR(150) NOT NULL,
  contact_licence      VARCHAR(100),
  email                VARCHAR(255) NOT NULL,
  status               ENUM('PENDING','VERIFIED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  review_note          TEXT,
  document_url         VARCHAR(500),
  verified_at          DATETIME,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_org_status (status),
  INDEX idx_org_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── User ↔ Organization Link ───────────────────────────────
ALTER TABLE users
  ADD COLUMN organization_id BIGINT,
  ADD CONSTRAINT fk_users_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE SET NULL;

-- ─── Medicine Batches ────────────────────────────────────────
CREATE TABLE medicine_batches (
  id                    BIGINT       AUTO_INCREMENT PRIMARY KEY,
  organization_id       BIGINT       NOT NULL,
  medicine_name         VARCHAR(255) NOT NULL,
  ndc_code              VARCHAR(30)  NOT NULL,
  lot_number            VARCHAR(50)  NOT NULL,
  manufacturer_name     VARCHAR(255) NOT NULL,
  dosage_form           ENUM('TABLET','CAPSULE','INJECTION','INFUSION','ORAL_LIQUID','CREAM','PATCH','OTHER') NOT NULL DEFAULT 'TABLET',
  strength              VARCHAR(100),
  expiry_date           DATE         NOT NULL,
  quantity              INT          NOT NULL CHECK (quantity > 0),
  storage_type          ENUM('AMBIENT','REFRIGERATED','FROZEN','DEEP_FROZEN') NOT NULL DEFAULT 'AMBIENT',
  storage_log           VARCHAR(255),
  packaging_integrity   BOOLEAN      NOT NULL DEFAULT FALSE,
  not_recalled          BOOLEAN      NOT NULL DEFAULT FALSE,
  special_notes         TEXT,
  status                ENUM('PENDING_REVIEW','APPROVED','REJECTED','WITHDRAWN') NOT NULL DEFAULT 'PENDING_REVIEW',
  review_note           TEXT,
  reviewed_by           BIGINT,
  reviewed_at           DATETIME,
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_batch_org FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_batch_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_batch_status (status),
  INDEX idx_batch_expiry (expiry_date),
  INDEX idx_batch_ndc (ndc_code),
  INDEX idx_batch_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Stock Requests ──────────────────────────────────────────
CREATE TABLE stock_requests (
  id                  BIGINT       AUTO_INCREMENT PRIMARY KEY,
  batch_id            BIGINT       NOT NULL,
  requester_org_id    BIGINT       NOT NULL,
  requester_user_id   BIGINT       NOT NULL,
  requested_quantity  INT          NOT NULL CHECK (requested_quantity > 0),
  clinical_note       TEXT,
  status              ENUM('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  admin_note          TEXT,
  reviewed_by         BIGINT,
  reviewed_at         DATETIME,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_req_batch FOREIGN KEY (batch_id)
    REFERENCES medicine_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_org FOREIGN KEY (requester_org_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_user FOREIGN KEY (requester_user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_reviewer FOREIGN KEY (reviewed_by)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_req_status (status),
  INDEX idx_req_batch (batch_id),
  INDEX idx_req_org (requester_org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Transfers ───────────────────────────────────────────────
CREATE TABLE transfers (
  id                  BIGINT       AUTO_INCREMENT PRIMARY KEY,
  request_id          BIGINT       NOT NULL UNIQUE,
  batch_id            BIGINT       NOT NULL,
  donor_org_id        BIGINT       NOT NULL,
  recipient_org_id    BIGINT       NOT NULL,
  quantity            INT          NOT NULL CHECK (quantity > 0),
  status              ENUM('APPROVED','IN_TRANSIT','DELIVERED','RECEIPT_CONFIRMED','CANCELLED') NOT NULL DEFAULT 'APPROVED',
  tracking_id         VARCHAR(100),
  temperature_status  ENUM('COMPLIANT','MINOR_EXCURSION','CRITICAL_EXCURSION'),
  receipt_note        TEXT,
  dispatched_at       DATETIME,
  delivered_at        DATETIME,
  confirmed_at        DATETIME,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_xfer_request FOREIGN KEY (request_id)
    REFERENCES stock_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_xfer_batch FOREIGN KEY (batch_id)
    REFERENCES medicine_batches(id) ON DELETE CASCADE,
  CONSTRAINT fk_xfer_donor FOREIGN KEY (donor_org_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_xfer_recipient FOREIGN KEY (recipient_org_id)
    REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_xfer_status (status),
  INDEX idx_xfer_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Notifications ───────────────────────────────────────────
CREATE TABLE notifications (
  id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT       NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT         NOT NULL,
  type        ENUM('BATCH_APPROVED','BATCH_REJECTED','REQUEST_APPROVED','REQUEST_REJECTED','TRANSFER_UPDATE','EXPIRY_ALERT','GENERAL') NOT NULL DEFAULT 'GENERAL',
  is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  action_url  VARCHAR(500),
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Audit Log ───────────────────────────────────────────────
CREATE TABLE audit_logs (
  id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
  action      VARCHAR(50)  NOT NULL,
  entity_type VARCHAR(50)  NOT NULL,
  entity_id   BIGINT       NOT NULL,
  user_id     BIGINT,
  user_name   VARCHAR(150),
  user_role   VARCHAR(20),
  details     TEXT,
  ip_address  VARCHAR(45),
  timestamp   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Contact Messages ────────────────────────────────────────
CREATE TABLE contact_messages (
  id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(255),
  message    TEXT         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── System Settings ─────────────────────────────────────────
CREATE TABLE system_settings (
  setting_key   VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(500) NOT NULL,
  description   VARCHAR(255),
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Defaults
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('min_expiry_days', '60', 'Minimum days until expiry for listing a batch'),
  ('max_cold_chain_excursion', '0.5', 'Maximum cold-chain temperature deviation in °C'),
  ('auto_withdrawal_days', '14', 'Auto-withdraw batches with fewer than this many days to expiry'),
  ('audit_retention_years', '6', 'Audit log retention period in years (DSCSA minimum: 6)');

-- ─── Seed Admin User ─────────────────────────────────────────
-- Password: admin1234  (BCrypt hash)
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('admin@medishare.health', '$2a$10$xE2rO4V3Qe8Hp7Wq0AJSM.Fj3OVEpZr/vVXvQjVlHqP5V6yNO0wW', 'Chief Compliance Officer', 'ADMIN');
