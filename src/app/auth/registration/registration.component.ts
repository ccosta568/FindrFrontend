import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['USER']
    }, { validators: this.passwordMatchValidator() });
  }

  ngOnInit(): void {
    // Clear session data (localStorage/sessionStorage) when navigating to registration
    localStorage.removeItem('token'); // Remove token if present
    localStorage.removeItem('username'); // Remove the current username if present
    console.log('Session data cleared on registration page');
  }

    // Inline password match validator
    passwordMatchValidator(): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');
  
        return password && confirmPassword && password.value !== confirmPassword.value
          ? { passwordMismatch: true }
          : null;
      };
    }
    onSubmit() {
      if (this.registerForm.valid) {
        const { confirmPassword, ...request } = this.registerForm.value;
        console.log('Registering:', request);
    
        // Step 1: Register the user
        this.http.post('http://localhost:8080/api/auth/register', request, { responseType: 'text' })
          .subscribe({
            next: (response) => {
              console.log('Registration success:', response);
    
              // Step 2: Automatically log in with the same credentials
              const loginPayload = {
                username: request.username,
                password: request.password
              };
    
              this.http.post<{ username: string, token: string }>(
                'http://localhost:8080/api/auth/login',
                loginPayload
              ).subscribe({
                next: (loginRes) => {
                  localStorage.setItem('username', loginRes.username);
                  localStorage.setItem('token', loginRes.token);
                  console.log('Auto-login successful. Logged in as:', loginRes.username);
    
                  this.router.navigate(['/location']);
                },
                error: (loginErr) => {
                  console.error('Auto-login failed after registration:', loginErr);
                  this.router.navigate(['/login']); // fallback
                }
              });
            },
            error: (error) => {
              console.error('Registration failed:', error);
            }
          });
      }
    }
    
}
