import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FindrEvent } from '../models/event.model'; // Adjust the import as needed

@Injectable({
  providedIn: 'root',
})
export class EventService {
//  private baseUrl = 'http://localhost:8080/api/events'; // Your backend URL
    private baseUrl = 'https://findrbackend.onrender.com/api/events';

  constructor(private http: HttpClient) {}

  // Update this method to accept zipCode as a parameter
  getEvents(zipCode: string): Observable<FindrEvent[]> {
    return this.http.get<FindrEvent[]>(`${this.baseUrl}/eventbrite?zipcode=${zipCode}`);
  }
}
