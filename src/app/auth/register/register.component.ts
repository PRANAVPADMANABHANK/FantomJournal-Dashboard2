import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { ApiService } from '../../service/api.service';
import { HttpClient } from '@angular/common/http';



// service

// types

@Component({
  selector: 'app-auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  signUpForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Add this line
  });

  formSubmitted: boolean = false;
  showPassword: boolean = false;
  loading: boolean = false;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {}

  /**
   * convenience getter for easy access to form fields
   */
  get formValues() {
    return this.signUpForm.controls;
  }

  /**
   * On form submit
   */
  onSubmit(): void {
    this.formSubmitted = true;

    if (this.signUpForm.valid) {
      this.loading = true;
      const formData = {
        name: this.signUpForm.value.name,
        email: this.signUpForm.value.email,
        password: this.signUpForm.value.password,
        mobile: this.signUpForm.value.mobile,
      };


      // Send data to the server
      this.apiService.signup(formData).subscribe({
        next: (response) => {
          
            console.log('Signup successful', response);
            this.router.navigate(['/auth/login']);
            // this.router.navigate(['/auth/confirm-mail']);
        },
        error: (error) => {
            if (error.status === 500 && error.error.error && error.error.error.includes('E11000 duplicate key error')) {
                const duplicateField = error.error.error.includes('email') ? 'email' : 'another field';
                console.error(`Signup failed: Duplicate ${duplicateField}`);
                // Display the error message to the user
                alert(`The ${duplicateField} "${formData.email}" is already in use. Please use a different ${duplicateField}.`);
            } else {
                console.error('Signup failed', error);
                // Handle other errors
                alert('Signup failed. Please try again.');
            }
        },
    });
    }
  }
}
