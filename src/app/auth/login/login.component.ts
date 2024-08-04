import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';

// service
import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  formSubmitted: boolean = false;
  error: string = '';
  returnUrl: string = '/dashboard';
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService, // Use ApiService
    private fb: FormBuilder
  ) {
    // Initialize loginForm with FormBuilder
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || this.returnUrl;
  }

  /**
   * Convenience getter for easy access to form fields
   */
  get formValues() {
    return this.loginForm.controls;
  }

  /**
   * On submit form
   */
  onSubmit(): void {
    this.formSubmitted = true;

    if (this.loginForm.invalid) {
      return; // Do nothing if form is invalid
    }

    this.loading = true;
    const formData = {
      email: this.formValues['email'].value,
      password: this.formValues['password'].value,
    };

    this.apiService.login(formData).subscribe({
      next: (response: any) => {
        console.log(response, 'user data with tokens got');
        // Handle successful login
        if (response && response.accessToken) {
          // Store tokens and user data in local storage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.user));

          this.router.navigate([this.returnUrl]);
        } else {
          this.error = 'Login failed/Incorrect Password. Please try again.';
        }
        this.loading = false;
      },
      error: (error: any) => {
        // Handle errors
        if (error.status === 400) {
          this.error =
            'Invalid credentials. Please check your email and password.';
        } else {
          this.error = 'An error occurred. Please try again later.';
        }
        this.loading = false;
        console.error('Login failed', error);
      },
    });
  }
}
