CREATE DATABASE IF NOT EXISTS qamsoft_fleet_erp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE qamsoft_fleet_erp;

CREATE TABLE IF NOT EXISTS drivers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50) NULL,
  last_name VARCHAR(50) NOT NULL,
  cnic_number VARCHAR(15) NOT NULL,
  license_number VARCHAR(30) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT pk_drivers PRIMARY KEY (id),
  CONSTRAINT uq_drivers_cnic UNIQUE (cnic_number),
  CONSTRAINT uq_drivers_license UNIQUE (license_number),
  CONSTRAINT ck_drivers_status
    CHECK (status IN ('Active', 'Inactive', 'Suspended'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  registration_number VARCHAR(15) NOT NULL,
  make VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  manufacturing_year INT NOT NULL,
  vehicle_type VARCHAR(30) NOT NULL,
  fuel_type VARCHAR(20) NOT NULL,
  odometer BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Available',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
    ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT pk_vehicles PRIMARY KEY (id),
  CONSTRAINT uq_vehicles_registration UNIQUE (registration_number),
  CONSTRAINT ck_vehicles_year
    CHECK (manufacturing_year BETWEEN 1980 AND 2100),
  CONSTRAINT ck_vehicles_odometer CHECK (odometer >= 0),
  CONSTRAINT ck_vehicles_status
    CHECK (status IN ('Available', 'Assigned', 'Maintenance', 'Inactive'))
) ENGINE=InnoDB;

-- Run these statements as a MySQL administrator, and change the password first.
CREATE USER IF NOT EXISTS 'fleet_app'@'localhost'
  IDENTIFIED BY 'change_this_password';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON qamsoft_fleet_erp.*
  TO 'fleet_app'@'localhost';

FLUSH PRIVILEGES;
