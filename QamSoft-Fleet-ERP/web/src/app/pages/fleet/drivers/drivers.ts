import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
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
  Driver,
  DriverFormValue
} from './driver.model';

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
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './drivers.html',
  styleUrl: './drivers.scss',
})
export class Drivers implements OnInit {
  readonly driverStatuses = [
    'Active',
    'Inactive',
    'Suspended'
  ];

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
  readonly modifyDriverForm: DriverForm;

  @ViewChild('modifyDialog')
  private modifyDialog!: TemplateRef<unknown>;

  private readonly storageKey =
    'qamsoft-fleet-erp.drivers.v1';

  private nextDriverId = 1;
  private selectedDriverId: number | null = null;
  private dialogReference?: MatDialogRef<unknown>;

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialog: MatDialog
  ) {
    this.driverForm = this.createDriverForm();
    this.modifyDriverForm = this.createDriverForm();
  }

  ngOnInit(): void {
    this.loadDrivers();
  }

  saveDriver(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    const formValue = this.normalizeFormValue(
      this.driverForm.getRawValue()
    );

    const newDriver: Driver = {
      id: this.nextDriverId++,
      ...formValue
    };

    this.dataSource.data = [
      ...this.dataSource.data,
      newDriver
    ];

    this.persistDrivers();
    this.resetAddForm();
    this.moveToLastPage();

    console.log('Driver saved:', newDriver);
  }

  deleteDriver(driverId: number): void {
    const deletedDriver = this.dataSource.data.find(
      driver => driver.id === driverId
    );

    this.dataSource.data = this.dataSource.data.filter(
      driver => driver.id !== driverId
    );

    this.persistDrivers();
    this.correctPaginatorAfterDelete();

    console.log('Driver deleted:', deletedDriver);
  }

  openModifyDialog(driver: Driver): void {
    this.selectedDriverId = driver.id;

    this.modifyDriverForm.setValue({
      firstName: driver.firstName,
      middleName: driver.middleName,
      lastName: driver.lastName,
      cnicNumber: driver.cnicNumber,
      licenseNumber: driver.licenseNumber,
      phoneNumber: driver.phoneNumber,
      status: driver.status
    });

    this.dialogReference = this.dialog.open(
      this.modifyDialog,
      {
        width: '850px',
        maxWidth: '95vw',
        disableClose: true
      }
    );

    this.dialogReference.afterClosed().subscribe(() => {
      this.selectedDriverId = null;
      this.modifyDriverForm.reset(this.emptyDriver());
      this.dialogReference = undefined;
    });
  }

  updateDriver(): void {
    if (
      this.selectedDriverId === null ||
      this.modifyDriverForm.invalid
    ) {
      this.modifyDriverForm.markAllAsTouched();
      return;
    }

    const driverId = this.selectedDriverId;
    const formValue = this.normalizeFormValue(
      this.modifyDriverForm.getRawValue()
    );

    this.dataSource.data = this.dataSource.data.map(
      driver =>
        driver.id === driverId
          ? {
              id: driver.id,
              ...formValue
            }
          : driver
    );

    this.persistDrivers();

    console.log(
      'Driver modified:',
      this.dataSource.data.find(
        driver => driver.id === driverId
      )
    );

    this.dialogReference?.close();
  }

  closeModifyDialog(): void {
    this.dialogReference?.close();
  }

  resetAddForm(): void {
    this.driverForm.reset(this.emptyDriver());
  }

  private createDriverForm(): DriverForm {
    return this.formBuilder.nonNullable.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],
      middleName: [
        '',
        Validators.maxLength(50)
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],
      cnicNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[0-9]{5}-[0-9]{7}-[0-9]$/
          )
        ]
      ],
      licenseNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          Validators.pattern(/^[A-Za-z0-9-]+$/)
        ]
      ],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^03[0-9]{2}-?[0-9]{7}$/)
        ]
      ],
      status: [
        'Active',
        Validators.required
      ]
    });
  }

  private emptyDriver(): DriverFormValue {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      cnicNumber: '',
      licenseNumber: '',
      phoneNumber: '',
      status: 'Active'
    };
  }

  private normalizeFormValue(
    value: DriverFormValue
  ): DriverFormValue {
    return {
      firstName: value.firstName.trim(),
      middleName: value.middleName.trim(),
      lastName: value.lastName.trim(),
      cnicNumber: value.cnicNumber.trim(),
      licenseNumber: value.licenseNumber
        .trim()
        .toUpperCase(),
      phoneNumber: value.phoneNumber.trim(),
      status: value.status
    };
  }

  private loadDrivers(): void {
    const storedValue = localStorage.getItem(
      this.storageKey
    );

    if (!storedValue) {
      return;
    }

    try {
      const parsedValue: unknown = JSON.parse(storedValue);

      if (!Array.isArray(parsedValue)) {
        console.error('Stored driver data is not an array.');
        return;
      }

      const savedDrivers = parsedValue.filter(
        (value): value is Driver => this.isDriver(value)
      );

      this.dataSource.data = savedDrivers;

      this.nextDriverId = savedDrivers.reduce(
        (highestId, driver) =>
          Math.max(highestId, driver.id),
        0
      ) + 1;

      console.log(
        'Drivers loaded from localStorage:',
        savedDrivers
      );
    } catch (error) {
      console.error('Could not load drivers:', error);
    }
  }

  private persistDrivers(): void {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.dataSource.data)
      );
    } catch (error) {
      console.error('Could not save drivers:', error);
    }
  }

  private isDriver(value: unknown): value is Driver {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Partial<Driver>;

    return (
      typeof candidate.id === 'number' &&
      typeof candidate.firstName === 'string' &&
      typeof candidate.middleName === 'string' &&
      typeof candidate.lastName === 'string' &&
      typeof candidate.cnicNumber === 'string' &&
      typeof candidate.licenseNumber === 'string' &&
      typeof candidate.phoneNumber === 'string' &&
      typeof candidate.status === 'string'
    );
  }

  private moveToLastPage(): void {
    const paginator = this.dataSource.paginator;

    if (!paginator) {
      return;
    }

    setTimeout(() => paginator.lastPage());
  }

  private correctPaginatorAfterDelete(): void {
    const paginator = this.dataSource.paginator;

    if (
      paginator &&
      paginator.pageIndex > 0 &&
      paginator.pageIndex * paginator.pageSize >=
        this.dataSource.data.length
    ) {
      paginator.previousPage();
    }
  }
}
