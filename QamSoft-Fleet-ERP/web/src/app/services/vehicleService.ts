import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {

    // Construction Injection 
    constructor(private http: HttpClient) { }
    apiURL: string = 'https://locahost:5001/api/';

    getAllVehicles() : Observable<any>{
      return this.http.get<any>( this.apiURL + '/Vehicles/GetAll');
    }

    getAllDrivers() : Observable<any>{
      return this.http.get<any>( this.apiURL + '/Drivers/GetAll');
    }

  //   GetInquiry(): Observable<InquiryVM[]> {
  //   return this.http.get<InquiryVM[]>(Globals.BASE_API_URL + 'Inquiry').pipe();
  // }
}
