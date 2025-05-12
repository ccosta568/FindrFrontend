import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../services/favorite.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saved-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-events.component.html',
  styleUrls: ['./saved-events.component.scss']
})
export class SavedEventsComponent implements OnInit {
  savedEvents: any[] = [];

  constructor(private favoriteService: FavoriteService, private router: Router) {}

  ngOnInit() {
    console.log('[SavedEventsComponent] Fetching favorites from backend...');

    this.favoriteService.getFavorites().subscribe({
      next: (events) => {
        this.savedEvents = events;

        console.log(`[SavedEventsComponent] Received ${events.length} favorites:`);
        events.forEach((e, index) => {
          console.log(`  #${index + 1} -> ID: ${e.id}, EventID: ${e.eventId}, Title: ${e.title}`);
        });
      },
      error: (err) => {
        console.error('[SavedEventsComponent] Error loading favorites:', err);
      }
    });
  }

  goToEvents() {
  this.router.navigate(['/events']);
}

  deleteEvent(eventId: number) {
    this.favoriteService.deleteFavorite(eventId).subscribe({
      next: () => {
        this.savedEvents = this.savedEvents.filter(event => event.id !== eventId);
      },
      error: (err) => {
        console.error(`[SavedEventsComponent] Error deleting event ID ${eventId}:`, err);
      }
    });
  }
}
