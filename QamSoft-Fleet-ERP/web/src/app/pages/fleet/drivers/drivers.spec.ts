import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { DriverService } from '../../../services/driverService';
import { Driver } from './driver.model';
import { Drivers } from './drivers';

describe('Drivers', () => {
  let component: Drivers;
  let fixture: ComponentFixture<Drivers>;
  let driversFromApi: Subject<Driver[]>;

  const validDriver = {
    firstName: 'Ali',
    middleName: 'Ahmed',
    lastName: 'Khan',
    cnicNumber: '12345-1234567-1',
    licenseNumber: 'LIC-1001',
    phoneNumber: '0300-1234567',
    status: 'Active'
  };

  beforeEach(async () => {
    driversFromApi = new Subject<Driver[]>();

    await TestBed.configureTestingModule({
      imports: [Drivers],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: DriverService,
          useValue: { getAllDrivers: () => driversFromApi }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Drivers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display drivers returned by the API', () => {
    driversFromApi.next([{ id: 9, ...validDriver }]);

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].id).toBe(9);
    expect(component.dataSource.data[0].firstName).toBe('Ali');
  });

  it('should save a driver in the grid', () => {
    component.driverForm.setValue(validDriver);
    component.saveDriver();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].firstName).toBe('Ali');
  });

  it('should reject duplicate CNIC numbers', () => {
    component.driverForm.setValue(validDriver);
    component.saveDriver();

    component.driverForm.setValue({
      ...validDriver,
      licenseNumber: 'LIC-1002'
    });
    component.saveDriver();

    expect(component.driverForm.controls.cnicNumber.hasError('duplicate')).toBeTrue();
    expect(component.dataSource.data.length).toBe(1);
  });

  it('should delete a driver from the grid', () => {
    component.driverForm.setValue(validDriver);
    component.saveDriver();

    component.deleteDriver(component.dataSource.data[0].id);

    expect(component.dataSource.data.length).toBe(0);
  });
});
