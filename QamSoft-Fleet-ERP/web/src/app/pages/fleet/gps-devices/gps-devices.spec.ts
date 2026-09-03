import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsDevices } from './gps-devices';

describe('GpsDevices', () => {
  let component: GpsDevices;
  let fixture: ComponentFixture<GpsDevices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpsDevices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GpsDevices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
