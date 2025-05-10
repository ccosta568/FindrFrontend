import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiscardService {
  private apiUrl = 'http://localhost:8080/api/discards';

  constructor(private http: HttpClient) {}

  discardEvent(event: any): Observable<any> {
    const token = localStorage.getItem('token'); // Get token from localStorage
    
        if (!token) {
          console.error('No token found in localStorage!');
          return throwError('No token found');
        }
    
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`, // Add token to request headers
        });
        console.log('Discarding event:', event);
        console.log('Using token:', token);
    return this.http.post(`${this.apiUrl}`, event, { headers }).pipe();
  }

  // Optional: Handle logging and error inside the service as well
  handleDiscard(event: any) {
    this.discardEvent(event).subscribe(
      () => {
        console.log('Event discarded');
      },
      (error) => {
        console.error('Error discarding event:', error);
      }
    );
  }
       // Method to retrieve discarded event IDs
  getDiscardedEventIds(): Observable<string[]> {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token) {
      console.error('No token found in localStorage!');
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Include token in request headers
    });

    return this.http.get<any[]>(`${this.apiUrl}`, { headers }).pipe(
      map((discards) => discards.map((event) => event.eventId)), // Extract IDs from discarded events
      catchError((error) => {
        console.error('Error fetching discarded event IDs:', error);
        return throwError(() => error);
      })
    );
  }
}
