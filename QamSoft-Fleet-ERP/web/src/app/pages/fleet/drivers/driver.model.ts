export interface Driver {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  cnicNumber: string;
  licenseNumber: string;
  phoneNumber: string;
  status: string;
}

export type DriverFormValue = Omit<Driver, 'id'>;
