export interface Vehicle {
  id: number;
  registrationNumber: string;
  make: string;
  model: string;
  manufacturingYear: number;
  vehicleType: string;
  fuelType: string;
  odometer: number;
  status: string;
}

export type VehicleFormValue = Omit<Vehicle, 'id'>;