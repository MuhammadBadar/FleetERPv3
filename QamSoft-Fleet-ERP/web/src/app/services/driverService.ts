import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Driver } from '../pages/fleet/drivers/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly apiUrl = 'http://localhost:5000/api/Drivers';

  constructor(private readonly http: HttpClient) {}

  getAllDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.apiUrl}/GetAllDrivers`);
  }
}
