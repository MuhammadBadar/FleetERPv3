// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-vehicles',
//   imports: [],
//   templateUrl: './vehicles.html',
//   styleUrl: './vehicles.scss',
// })
// export class Vehicles {

// }
import { Component, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule
} from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import {
  MatTableDataSource,
  MatTableModule
} from '@angular/material/table';

import {
  Vehicle,
  VehicleFormValue
} from './vehicle.model';

@Component({
  selector: 'app-vehicles',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.scss',
})
export class Vehicles {
  readonly currentYear = new Date().getFullYear();

  readonly vehicleTypes = [
    'Car',
    'Van',
    'Truck',
    'Bus',
    'Motorcycle'
  ];

  readonly fuelTypes = [
    'Petrol',
    'Diesel',
    'Electric',
    'Hybrid',
    'CNG'
  ];

  readonly vehicleStatuses = [
    'Available',
    'Assigned',
    'Maintenance',
    'Inactive'
  ];

  readonly displayedColumns: string[] = [
    'registrationNumber',
    'make',
    'model',
    'manufacturingYear',
    'vehicleType',
    'fuelType',
    'odometer',
    'status',
    'actions'
  ];

  readonly pageSizeOptions = [5, 10, 20, 50];

  readonly dataSource =
    new MatTableDataSource<Vehicle>([]);

  editingVehicleId: number | null = null;

  private nextVehicleId = 1;

  /*
   * A setter is used because the paginator only appears
   * after at least one vehicle has been added.
   */
  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  readonly vehicleForm = new FormGroup({
    registrationNumber: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
          Validators.pattern(/^[A-Za-z0-9-]+$/)
        ]
      }
    ),

    make: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      }
    ),

    model: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.maxLength(50)
        ]
      }
    ),

    manufacturingYear: new FormControl(
      this.currentYear,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(1980),
          Validators.max(this.currentYear + 1)
        ]
      }
    ),

    vehicleType: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    fuelType: new FormControl(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    odometer: new FormControl(
      0,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0),
          Validators.max(10_000_000)
        ]
      }
    ),

    status: new FormControl(
      'Available',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    )
  });

  saveVehicle(): void {
    this.clearDuplicateRegistrationError();

    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const formValue = this.normalizeFormValue(
      this.vehicleForm.getRawValue()
    );

    if (
      this.registrationNumberExists(
        formValue.registrationNumber
      )
    ) {
      this.vehicleForm.controls.registrationNumber.setErrors({
        ...this.vehicleForm.controls.registrationNumber.errors,
        duplicate: true
      });

      this.vehicleForm.controls.registrationNumber.markAsTouched();
      return;
    }

    if (this.editingVehicleId === null) {
      this.addVehicle(formValue);
    } else {
      this.updateVehicle(formValue);
    }

    this.clearForm();
  }

  modifyVehicle(vehicle: Vehicle): void {
    this.editingVehicleId = vehicle.id;

    this.clearDuplicateRegistrationError();

    this.vehicleForm.setValue({
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make,
      model: vehicle.model,
      manufacturingYear: vehicle.manufacturingYear,
      vehicleType: vehicle.vehicleType,
      fuelType: vehicle.fuelType,
      odometer: vehicle.odometer,
      status: vehicle.status
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  deleteVehicle(vehicleId: number): void {
    const updatedVehicles =
      this.dataSource.data.filter(
        vehicle => vehicle.id !== vehicleId
      );

    this.dataSource.data = updatedVehicles;

    if (this.editingVehicleId === vehicleId) {
      this.clearForm();
    }

    this.correctPaginatorAfterDelete();
  }

  clearForm(): void {
    this.editingVehicleId = null;

    this.vehicleForm.reset({
      registrationNumber: '',
      make: '',
      model: '',
      manufacturingYear: this.currentYear,
      vehicleType: '',
      fuelType: '',
      odometer: 0,
      status: 'Available'
    });

    this.clearDuplicateRegistrationError();
  }

  registrationNumberChanged(): void {
    this.clearDuplicateRegistrationError();
  }

  private addVehicle(
    formValue: VehicleFormValue
  ): void {
    const newVehicle: Vehicle = {
      id: this.nextVehicleId++,
      ...formValue
    };

    this.dataSource.data = [
      ...this.dataSource.data,
      newVehicle
    ];

    this.moveToLastPage();
  }

  private updateVehicle(
    formValue: VehicleFormValue
  ): void {
    this.dataSource.data =
      this.dataSource.data.map(vehicle =>
        vehicle.id === this.editingVehicleId
          ? {
              id: vehicle.id,
              ...formValue
            }
          : vehicle
      );
  }

  private registrationNumberExists(
    registrationNumber: string
  ): boolean {
    return this.dataSource.data.some(
      vehicle =>
        vehicle.registrationNumber.toLowerCase() ===
          registrationNumber.toLowerCase() &&
        vehicle.id !== this.editingVehicleId
    );
  }

  private clearDuplicateRegistrationError(): void {
    const control =
      this.vehicleForm.controls.registrationNumber;

    if (!control.hasError('duplicate')) {
      return;
    }

    const currentErrors = {
      ...control.errors
    };

    delete currentErrors['duplicate'];

    control.setErrors(
      Object.keys(currentErrors).length > 0
        ? currentErrors
        : null
    );
  }

  private normalizeFormValue(
    value: VehicleFormValue
  ): VehicleFormValue {
    return {
      registrationNumber:
        value.registrationNumber
          .trim()
          .toUpperCase(),

      make: value.make.trim(),
      model: value.model.trim(),
      manufacturingYear:
        Number(value.manufacturingYear),
      vehicleType: value.vehicleType,
      fuelType: value.fuelType,
      odometer: Number(value.odometer),
      status: value.status
    };
  }

  private moveToLastPage(): void {
    const paginator = this.dataSource.paginator;

    if (!paginator) {
      return;
    }

    /*
     * The timeout allows the paginator length to update
     * after the new table row has been rendered.
     */
    setTimeout(() => {
      paginator.lastPage();
    });
  }

  private correctPaginatorAfterDelete(): void {
    const paginator = this.dataSource.paginator;

    if (!paginator) {
      return;
    }

    const lastPageIndex = Math.max(
      Math.ceil(
        this.dataSource.data.length /
        paginator.pageSize
      ) - 1,
      0
    );

    if (paginator.pageIndex > lastPageIndex) {
      paginator.pageIndex = lastPageIndex;
      paginator._changePageSize(paginator.pageSize);
    }
  }
}