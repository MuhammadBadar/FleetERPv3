import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Vehicle } from '../pages/fleet/vehicles/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly apiUrl = 'http://localhost:5000/api/Vehicles';

  constructor(private readonly http: HttpClient) {}

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/GetAllVehicles`);
  }
}
