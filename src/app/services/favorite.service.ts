import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
//  private apiUrl = 'http://localhost:8080/api/favorites'; // Backend URL for favorites
    private apiUrl = 'https://findrbackend.onrender.com/api/favorites';

  constructor(private http: HttpClient) {}

  // Save a favorite event
  saveFavorite(event: any): Observable<any> {
    const token = localStorage.getItem('token'); // Get token from localStorage

    if (!token) {
      console.error('No token found in localStorage!');
      return throwError('No token found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Add token to request headers
    });

    console.log('Saving favorite event:', event);
    console.log('Using token:', token);

    return this.http.post(`${this.apiUrl}`, event, { headers }).pipe(
      catchError(this.handleError) // Handle any errors
    );
  }

  // Get all favorite events for the logged-in user
  getFavorites(): Observable<any[]> {
    const token = localStorage.getItem('token'); // Get token from localStorage

    if (!token) {
      console.error('No token found in localStorage!');
      return throwError('No token found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Add token to request headers
    });

    console.log('Fetching favorite events for the user with token:', token);

    return this.http.get<any[]>(`${this.apiUrl}`, { headers }).pipe(
      catchError(this.handleError) // Handle any errors
    );
  }

// Delete a favorite event
deleteFavorite(eventId: number): Observable<any> {
  const token = localStorage.getItem('token'); // Get token from localStorage

  if (!token) {
    console.error('No token found in localStorage!');
    return throwError(() => new Error('No token found')); // Return an observable error
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`, // Add token to request headers
  });

  return this.http.delete(`${this.apiUrl}/${eventId}`, { headers });
}

 // Method to retrieve Favorite event IDs
 getFavoriteEventIds(): Observable<string[]> {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token) {
      console.error('No token found in localStorage!');
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Include token in request headers
    });

    return this.http.get<any[]>(`${this.apiUrl}`, { headers }).pipe(
      map((favorites) => favorites.map((event) => event.eventId)), // Extract IDs from fav events
      catchError((error) => {
        console.error('Error fetching favorites event IDs:', error);
        return throwError(() => error);
      })
    );
    }

  // Handle errors from HTTP requests
  private handleError(error: HttpErrorResponse) {
    console.error('Error occurred:', error);
    let errorMessage = 'An error occurred';
    
    if (error.status === 0) {
      errorMessage = 'Network error';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden: You do not have permission to access this resource';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized: Please log in to access this resource';
    }

    return throwError(errorMessage);
  }
}


