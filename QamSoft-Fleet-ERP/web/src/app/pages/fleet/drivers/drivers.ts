import { Component, OnInit, signal, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { Driver, DriverFormValue } from './driver.model';
import { DriverService } from '../../../services/driverService';

type DriverForm = FormGroup<{
  firstName: FormControl<string>;
  middleName: FormControl<string>;
  lastName: FormControl<string>;
  cnicNumber: FormControl<string>;
  licenseNumber: FormControl<string>;
  phoneNumber: FormControl<string>;
  status: FormControl<string>;
}>;

@Component({
  selector: 'app-drivers',
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
  templateUrl: './drivers.html',
  styleUrl: './drivers.scss'
})
export class Drivers implements OnInit {
  readonly driverStatuses = ['Active', 'Inactive', 'Suspended'];

  readonly displayedColumns: string[] = [
    'firstName',
    'middleName',
    'lastName',
    'cnicNumber',
    'licenseNumber',
    'phoneNumber',
    'status',
    'actions'
  ];

  readonly pageSizeOptions = [5, 10, 20, 50];
  readonly dataSource = new MatTableDataSource<Driver>([]);
  readonly driverForm: DriverForm;

  editingDriverId: number | null = null;
  readonly isLoadingDrivers = signal(true);
  readonly driverLoadError = signal('');

  private nextDriverId = 1;

  constructor(
    private readonly fb: FormBuilder,
    private readonly driverService: DriverService
  ) {
    this.driverForm = this.createDriverForm();
  }

  ngOnInit(): void {
    this.loadDriversFromApi();
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  saveDriver(): void {
    this.clearDuplicateErrors();

    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    const formValue = this.normalizeFormValue(this.driverForm.getRawValue());

    if (this.cnicExists(formValue.cnicNumber)) {
      this.setDuplicateError('cnicNumber');
      return;
    }

    if (this.licenseExists(formValue.licenseNumber)) {
      this.setDuplicateError('licenseNumber');
      return;
    }

    if (this.editingDriverId === null) {
      this.addDriver(formValue);
    } else {
      this.updateDriver(formValue);
    }

    this.clearForm();
  }

  modifyDriver(driver: Driver): void {
    this.editingDriverId = driver.id;
    this.clearDuplicateErrors();

    this.driverForm.setValue({
      firstName: driver.firstName,
      middleName: driver.middleName,
      lastName: driver.lastName,
      cnicNumber: driver.cnicNumber,
      licenseNumber: driver.licenseNumber,
      phoneNumber: driver.phoneNumber,
      status: driver.status
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteDriver(driverId: number): void {
    this.dataSource.data = this.dataSource.data.filter(
      driver => driver.id !== driverId
    );

    if (this.editingDriverId === driverId) {
      this.clearForm();
    }

    this.correctPaginatorAfterDelete();
    console.log('Driver deleted. Current drivers:', this.dataSource.data);
  }

  clearForm(): void {
    this.editingDriverId = null;

    this.driverForm.reset({
      firstName: '',
      middleName: '',
      lastName: '',
      cnicNumber: '',
      licenseNumber: '',
      phoneNumber: '',
      status: 'Active'
    });

    this.clearDuplicateErrors();
  }

  uniqueFieldChanged(): void {
    this.clearDuplicateErrors();
  }

  private createDriverForm(): DriverForm {
    return this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      middleName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      cnicNumber: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{7}-\d$/)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^03\d{2}-?\d{7}$/)]],
      status: ['Active', [Validators.required]]
    });
  }

  private addDriver(formValue: DriverFormValue): void {
    const driver: Driver = {
      id: this.nextDriverId++,
      ...formValue
    };

    this.dataSource.data = [...this.dataSource.data, driver];
    this.moveToLastPage();
    console.log('Driver added:', driver);
  }

  private updateDriver(formValue: DriverFormValue): void {
    this.dataSource.data = this.dataSource.data.map(driver =>
      driver.id === this.editingDriverId
        ? { id: driver.id, ...formValue }
        : driver
    );

    console.log('Driver updated:', formValue);
  }

  private normalizeFormValue(value: DriverFormValue): DriverFormValue {
    return {
      firstName: value.firstName.trim(),
      middleName: value.middleName.trim(),
      lastName: value.lastName.trim(),
      cnicNumber: value.cnicNumber.trim(),
      licenseNumber: value.licenseNumber.trim().toUpperCase(),
      phoneNumber: value.phoneNumber.trim(),
      status: value.status
    };
  }

  private cnicExists(cnicNumber: string): boolean {
    return this.dataSource.data.some(
      driver =>
        driver.cnicNumber === cnicNumber &&
        driver.id !== this.editingDriverId
    );
  }

  private licenseExists(licenseNumber: string): boolean {
    return this.dataSource.data.some(
      driver =>
        driver.licenseNumber.toLowerCase() === licenseNumber.toLowerCase() &&
        driver.id !== this.editingDriverId
    );
  }

  private setDuplicateError(controlName: 'cnicNumber' | 'licenseNumber'): void {
    const control = this.driverForm.controls[controlName];
    control.setErrors({ ...control.errors, duplicate: true });
    control.markAsTouched();
  }

  private clearDuplicateErrors(): void {
    this.removeControlError(this.driverForm.controls.cnicNumber, 'duplicate');
    this.removeControlError(this.driverForm.controls.licenseNumber, 'duplicate');
  }

  private removeControlError(control: FormControl<string>, errorName: string): void {
    if (!control.hasError(errorName)) {
      return;
    }

    const errors = { ...control.errors };
    delete errors[errorName];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private loadDriversFromApi(): void {
    this.driverService.getAllDrivers().subscribe({
      next: drivers => {
        const normalizedDrivers = drivers.map(driver => ({
          ...driver,
          middleName: driver.middleName ?? ''
        }));

        this.dataSource.data = normalizedDrivers;
        this.nextDriverId = normalizedDrivers.reduce(
          (nextId, driver) => Math.max(nextId, driver.id + 1),
          1
        );
        this.isLoadingDrivers.set(false);
        this.driverLoadError.set('');
        console.log('Drivers loaded from API:', normalizedDrivers);
      },
      error: error => {
        this.isLoadingDrivers.set(false);
        this.driverLoadError.set('Unable to load drivers from the API.');
        console.error('Unable to load drivers from the API:', error);
      }
    });
  }

  private moveToLastPage(): void {
    const paginator = this.dataSource.paginator;

    if (paginator) {
      setTimeout(() => paginator.lastPage());
    }
  }

  private correctPaginatorAfterDelete(): void {
    const paginator = this.dataSource.paginator;

    if (!paginator) {
      return;
    }

    const lastPageIndex = Math.max(
      Math.ceil(this.dataSource.data.length / paginator.pageSize) - 1,
      0
    );

    if (paginator.pageIndex > lastPageIndex) {
      paginator.pageIndex = lastPageIndex;
      paginator._changePageSize(paginator.pageSize);
    }
  }
}
