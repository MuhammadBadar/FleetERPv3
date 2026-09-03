import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';  // Step : 1

@Component({
  selector: 'app-drivers',
  imports: [FormsModule],
  templateUrl: './drivers.html',
  styleUrl: './drivers.scss',
})
export class Drivers {

  // Step: 2//
  driverfields = {
  firstName: '',
  middleName: '',
  lastName: '',
  cnicNumber: '',
  licenseNumber: '',
  phoneNumber: ''
};

addDriver(): void {
  console.log('Driver submitted:', this.driverfields);
}

}
