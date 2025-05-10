import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  username: string | null = null;

  constructor(private router: Router) { }

  ngOnInit() {
    this.username = localStorage.getItem('username');
    console.log('Username from localStorage:', this.username);
  }

    // Method to capitalize the first letter of each word in the username
    capitalizeUsername(): string | null {
      if (this.username) {
        return this.username
          .split(' ')  // Split into words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize first letter
          .join(' ');  // Join the words back together
      }
      return null;
    }
    
}
