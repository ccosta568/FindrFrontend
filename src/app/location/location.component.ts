import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../services/event.service'; // adjust path if needed
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss',
})
export class LocationComponent implements OnInit {
  zipCode: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private eventService: EventService) {}

  ngOnInit(): void {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        this.zipCode = data.postal;
        console.log('ZIP from IP:', this.zipCode);
        localStorage.setItem('zipCode', this.zipCode);

        // ✅ Call backend
        this.eventService.getEvents(this.zipCode).subscribe({
          next: (events) => {
            console.log('Fetched Events:', events);

            // Optionally store or pass events to another component
            // For now just navigate
            this.router.navigate(['/events']);
          },
          error: (err) => {
            console.error('Error fetching events:', err);
            this.errorMessage = 'Failed to fetch events from the server.';
          }
        });
      })
      .catch(err => {
        console.error('ZIP error:', err);
        this.errorMessage = 'Could not determine your ZIP code.';
        this.zipCode = 'Unknown';
      });
  }
}

