import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { VehicleService } from '../../../services/vehicleService';
import { Vehicle } from './vehicle.model';
import { Vehicles } from './vehicles';

describe('Vehicles', () => {
  let component: Vehicles;
  let fixture: ComponentFixture<Vehicles>;
  let vehiclesFromApi: Subject<Vehicle[]>;

  beforeEach(async () => {
    vehiclesFromApi = new Subject<Vehicle[]>();

    await TestBed.configureTestingModule({
      imports: [Vehicles],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: VehicleService,
          useValue: { getAllVehicles: () => vehiclesFromApi }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vehicles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display vehicles returned by the API', () => {
    vehiclesFromApi.next([{
      id: 4,
      registrationNumber: 'LEA-1234',
      make: 'Toyota',
      model: 'Corolla',
      manufacturingYear: 2022,
      vehicleType: 'Car',
      fuelType: 'Petrol',
      odometer: 42500,
      status: 'Available'
    }]);

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].registrationNumber).toBe('LEA-1234');
  });
});
