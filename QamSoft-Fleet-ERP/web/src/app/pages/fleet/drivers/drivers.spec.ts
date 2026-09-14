import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Drivers } from './drivers';

describe('Drivers', () => {
  let component: Drivers;
  let fixture: ComponentFixture<Drivers>;

  beforeEach(async () => {
    localStorage.removeItem('qamsoft-fleet-erp.drivers.v1');

    await TestBed.configureTestingModule({
      imports: [Drivers],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(Drivers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem('qamsoft-fleet-erp.drivers.v1');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save a driver in the grid and localStorage', () => {
    component.driverForm.setValue({
      firstName: 'Ali',
      middleName: 'Ahmed',
      lastName: 'Khan',
      cnicNumber: '12345-1234567-1',
      licenseNumber: 'LIC-1001',
      phoneNumber: '0300-1234567',
      status: 'Active'
    });

    component.saveDriver();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].firstName).toBe('Ali');
    expect(localStorage.getItem('qamsoft-fleet-erp.drivers.v1')).not.toBeNull();
  });

  it('should delete a driver from the grid and localStorage', () => {
    component.driverForm.setValue({
      firstName: 'Sara',
      middleName: '',
      lastName: 'Ahmed',
      cnicNumber: '12345-7654321-2',
      licenseNumber: 'LIC-1002',
      phoneNumber: '0312-1234567',
      status: 'Active'
    });

    component.saveDriver();
    const driverId = component.dataSource.data[0].id;
    component.deleteDriver(driverId);

    expect(component.dataSource.data.length).toBe(0);
    expect(localStorage.getItem('qamsoft-fleet-erp.drivers.v1')).toBe('[]');
  });
});
