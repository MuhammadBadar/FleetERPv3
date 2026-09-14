// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';  // Step : 1
// import { FormBuilder, Validators } from '@angular/forms';

import { Component, OnInit } from '@angular/core';
//import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

import { Person } from '../../../models/person';


@Component({
  selector: 'app-drivers',
  imports: [
     ReactiveFormsModule,

  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatButtonModule,
  MatDividerModule,
  CommonModule
],
  templateUrl: './drivers.html',
  styleUrl: './drivers.scss',
})
export class Drivers implements OnInit {

   person: Person = new Person();

  personForm!: FormGroup;

  cities: string[] = [
    'Please Select',
    'Lahore',
    'Karachi',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Gujranwala',
    'Sialkot',
    'Hyderabad'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {

    this.personForm = this.fb.group({

      name: [
        this.person.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20)
        ]
      ],

      gender: [
        this.person.gender,
        Validators.required
      ],

      cell: [
        this.person.cell,
        [
          Validators.required,
          Validators.pattern(/^03[0-9]{9}$/)
        ]
      ],

      cnic: [
        this.person.cnic,
        [
          Validators.required,
          Validators.pattern(/^\d{5}-\d{7}-\d$/)
        ]
      ],
      city: [
        this.person.city,
        [
          Validators.required,
          this.cityValidator
        ]
      ],

      email: [
        this.person.email,
        [
          Validators.required,
          Validators.email
        ]
      ],

      dob: [
        this.person.dob,
        Validators.required
      ],

      age: [
        {
          value: this.person.age,
          disabled: true
        }
      ]
    });

    // Form -> Model synchronization
    this.personForm.valueChanges.subscribe(() => {

      Object.assign(
        this.person,
        this.personForm.getRawValue()
      );

    });

    // DOB -> Age
    this.personForm.get('dob')?.valueChanges.subscribe(dob => {

      if (dob) {

        const age = this.calculateAge(dob);

        this.person.age = age;

        this.personForm.get('age')?.setValue(age, {
          emitEvent: false
        });

      } else {

        this.person.age = null;

        this.personForm.get('age')?.setValue(null, {
          emitEvent: false
        });
      }
    });
  }


  // City custom validator
  cityValidator(control: AbstractControl): ValidationErrors | null {

    if (control.value === 'Please Select') {
      return { cityRequired: true };
    }

    return null;
  }


  // Calculate age
  calculateAge(dob: Date): number {

    const birthDate = new Date(dob);
    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() < birthDate.getDate()
      )
    ) {
      age--;
    }

    return age;
  }


  submit(): void {
    debugger;

    if (this.personForm.invalid) {

      this.personForm.markAllAsTouched();

      return;
    }

    console.log('Form Data:');
    console.log(this.personForm.getRawValue());

    console.log('Person Model:');
    console.log(this.person);
  }


  cancel(): void {

    this.person = new Person();

    this.personForm.reset({
      name: '',
      gender: 'Male',
      cell: '',
      city: 'Please Select',
      email: '',
      dob: null,
      age: null
    });

    this.personForm.markAsPristine();
    this.personForm.markAsUntouched();

  }

    // Convenience getters
  get name() {
    return this.personForm.get('name');
  }

  get cell() {
    return this.personForm.get('cell');
  }

  get city() {
    return this.personForm.get('city');
  }

  get email() {
    return this.personForm.get('email');
  }

  get dob() {
    return this.personForm.get('dob');
  }

  get cnic() {
  return this.personForm.get('cnic');
}
}
