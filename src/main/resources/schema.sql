-- Medicine Expiry and Redistribution System
-- Tables are created with IF NOT EXISTS so restarts never lose data.

CREATE TABLE IF NOT EXISTS users (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(100) NOT NULL UNIQUE,
    password_hash  VARCHAR(100) NOT NULL,
    role           ENUM('ADMIN', 'CLINIC') NOT NULL,
    clinic_name    VARCHAR(150),
    contact_person VARCHAR(150),
    phone          VARCHAR(30),
    address        VARCHAR(255),
    city           VARCHAR(100),
    status         ENUM('PENDING', 'ACTIVE', 'REJECTED') NOT NULL DEFAULT 'ACTIVE',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS donations (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id     BIGINT NOT NULL,
    medicine_name VARCHAR(150) NOT NULL,
    batch_no      VARCHAR(80),
    category      ENUM('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    quantity      INT    NOT NULL,
    expiry_date   DATE   NOT NULL,
    notes         VARCHAR(500),
    status        ENUM('PENDING', 'APPROVED', 'REJECTED', 'DISPENSED') NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at   TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_donation_clinic FOREIGN KEY (clinic_id) REFERENCES users (id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS requests (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id             BIGINT NOT NULL,
    medicine_name         VARCHAR(150) NOT NULL,
    category              ENUM('TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OINTMENT', 'OTHER') NOT NULL DEFAULT 'OTHER',
    quantity              INT    NOT NULL,
    urgency               ENUM('NORMAL', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    reason                VARCHAR(500),
    status                ENUM('PENDING', 'FULFILLED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at           TIMESTAMP NULL DEFAULT NULL,
    fulfilled_donation_id BIGINT NULL DEFAULT NULL,
    CONSTRAINT fk_request_clinic FOREIGN KEY (clinic_id) REFERENCES users (id)
) ENGINE = InnoDB;
