USE qamsoft_fleet_erp;

INSERT IGNORE INTO drivers (
  first_name,
  middle_name,
  last_name,
  cnic_number,
  license_number,
  phone_number,
  status
) VALUES
  ('Ali', 'Ahmed', 'Khan', '35202-1234567-1', 'LHR-10001', '0300-1234567', 'Active'),
  ('Sara', NULL, 'Ahmed', '35202-2345678-2', 'LHR-10002', '0312-2345678', 'Active'),
  ('Usman', 'Raza', 'Malik', '61101-3456789-3', 'ISB-20001', '0333-3456789', 'Active'),
  ('Ayesha', 'Noor', 'Siddiqui', '42101-4567890-4', 'KHI-30001', '0345-4567890', 'Inactive'),
  ('Bilal', NULL, 'Hussain', '37405-5678901-5', 'RWP-40001', '0301-5678901', 'Suspended'),
  ('Fatima', 'Zahra', 'Iqbal', '36302-6789012-6', 'MUX-50001', '0321-6789012', 'Active');

INSERT IGNORE INTO vehicles (
  registration_number,
  make,
  model,
  manufacturing_year,
  vehicle_type,
  fuel_type,
  odometer,
  status
) VALUES
  ('LEA-1234', 'Toyota', 'Corolla', 2022, 'Car', 'Petrol', 42500, 'Available'),
  ('LEB-5678', 'Honda', 'Civic', 2021, 'Car', 'Petrol', 58120, 'Assigned'),
  ('LES-9012', 'Toyota', 'Hiace', 2020, 'Van', 'Diesel', 87300, 'Assigned'),
  ('ICT-2024', 'Hyundai', 'H-100', 2023, 'Truck', 'Diesel', 19600, 'Available'),
  ('BSA-7788', 'Yutong', 'ZK6122H9', 2019, 'Bus', 'Diesel', 145700, 'Maintenance'),
  ('KHI-4455', 'Honda', 'CG 125', 2024, 'Motorcycle', 'Petrol', 8200, 'Inactive');
