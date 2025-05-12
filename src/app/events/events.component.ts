import { Component, AfterViewInit, OnInit, ChangeDetectorRef, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FindrEvent } from '../models/event.model';
import $ from 'jquery';
import { FavoriteService } from '../services/favorite.service';
import { DiscardService } from '../services/discard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, AfterViewInit {
  events: FindrEvent[] = [];
  currentIndex: number = 0;
  zipCode: string = '';
  errorMessage: string | undefined;
  locationFetched = false;
  noEventsMessage: string = '';

  constructor(
    private eventService: EventService,
    private favoriteService: FavoriteService,
    private discardService: DiscardService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.zipCode = localStorage.getItem('zipCode') || '';
  
    // Fetch favorite and discarded event IDs
    forkJoin({
      favoriteIds: this.favoriteService.getFavoriteEventIds(),
      discardIds: this.discardService.getDiscardedEventIds()
    }).subscribe(
      ({ favoriteIds, discardIds }) => {
        // Combine the IDs into a single Set for efficient lookup
        const excludedEventIds = new Set([...favoriteIds, ...discardIds]);
  
        this.eventService.getEvents(this.zipCode).subscribe(
          (data: FindrEvent[]) => {
            if (data?.length) {
              console.log("Raw Event Data:", data);
              console.log("EventID", excludedEventIds);
  
              // Filter out events with IDs in the excludedEventIds Set
              this.events = data.filter(event => !excludedEventIds.has(event.eventId));
  
              this.currentIndex = 0;

              if(this.events.length === 0){
                this.noEventsMessage = 'Sorry, no new events nearby';
              }
            }
          },
          (error) => {
            console.error('Error fetching events:', error);
          }
        );
      },
      (error) => {
        console.error('Error fetching event IDs:', error);
      }
    );
  }

  getLocation() {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        this.zipCode = data.postal;
        console.log('ZIP from IP:', this.zipCode);
        this.locationFetched = true;
        setTimeout(() => this.router.navigate(['/events']), 1000);
      })
      .catch(err => {
        console.error('ZIP error:', err);
        this.errorMessage = 'Could not determine your ZIP code.';
        this.zipCode = 'Unknown';
        this.locationFetched = true;
        this.router.navigate(['/events']);
      });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToSavedEvents() {
    this.router.navigate(['/saved-events']);
  }

  nextEvent() {
      if (this.events.length === 0) {
    this.noEventsMessage = 'Sorry, no new events nearby';
    return;
  }

   // Remove the swiped event
  this.events.splice(this.currentIndex, 1);

  // If there are still events left, reset currentIndex (it’s always 0 now since you remove the current one)
  if (this.events.length > 0) {
    this.currentIndex = 0;
  } else {
    this.noEventsMessage = 'Sorry, no new events nearby';
  }
    console.log("Remaining events:", this.events);
    console.log("Current Event Title:", this.events[this.currentIndex]);
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const component = this;

      $(document).ready(function () {
        let animating = false;
        let pullDeltaX = 0;
        let deg = 0;
        const decisionVal = 80;

        let alreadySwiped = false; // ✨ CHANGED: guard to prevent double save

        let $card: JQuery<HTMLElement>, $cardReject: JQuery<HTMLElement>, $cardLike: JQuery<HTMLElement>;

        function pullChange() {
          animating = true;
          deg = pullDeltaX / 10;
          $card.css('transform', `translateX(${pullDeltaX}px) rotate(${deg}deg)`);

          const opacity = pullDeltaX / 100;
          $cardReject.css('opacity', opacity >= 0 ? 0 : Math.abs(opacity));
          $cardLike.css('opacity', opacity <= 0 ? 0 : opacity);
        }

        function release() {
          if (Math.abs(pullDeltaX) >= decisionVal) {
            $card.addClass(pullDeltaX > 0 ? 'to-right' : 'to-left');

            // ✨ CHANGED: Guard against duplicate saves
            if (pullDeltaX > 0 && !alreadySwiped) {
              alreadySwiped = true;

              component.zone.run(() => {
                const eventToSave = component.events[component.currentIndex];
                component.favoriteService.saveFavorite(eventToSave).subscribe(() => {
                  console.log('Favorite saved');
                });
              });
            }

             // Handle the swipe left (discard) logic
             if (pullDeltaX < 0 && !alreadySwiped) {
              alreadySwiped = true;

              component.zone.run(() => {
                const eventToDiscard = component.events[component.currentIndex];
                component.discardService.handleDiscard(eventToDiscard); 
              });
            }

            setTimeout(() => {
              $card.addClass('below').removeClass('inactive to-left to-right');
              component.nextEvent();
              alreadySwiped = false; // ✨ CHANGED: reset guard after card change
            }, 300);
          } else {
            $card.addClass('reset');
          }

          setTimeout(() => {
            component.zone.run(() => {
              component.cdr.detectChanges();
            });

            $card.attr('style', '').removeClass('reset').find('.demo__card__choice').attr('style', '');
            pullDeltaX = 0;
            animating = false;
          }, 300);
        }

        $(document).on('mousedown touchstart', '.demo__card:not(.inactive)', function (e) {
          if (animating) return;

          $card = $(this);
          $cardReject = $('.demo__card__choice.m--reject', $card);
          $cardLike = $('.demo__card__choice.m--like', $card);

          let startX: number | undefined;
          if (e.type === 'touchstart') {
            startX = (e as unknown as TouchEvent).touches[0]?.pageX;
          } else if (e.type === 'mousedown') {
            startX = (e as unknown as MouseEvent).pageX;
          }

          if (startX === undefined) return;

          $(document).on('mousemove touchmove', function (e) {
            let x: number | undefined;
            if (e.type === 'touchmove') {
              x = (e as unknown as TouchEvent).touches[0]?.pageX;
            } else if (e.type === 'mousemove') {
              x = (e as unknown as MouseEvent).pageX;
            }

            if (x !== undefined) {
              pullDeltaX = x - startX;
              if (!pullDeltaX) return;
              pullChange();
            }
          });

          $(document).on('mouseup touchend', function () {
            $(document).off('mousemove touchmove mouseup touchend');
            if (!pullDeltaX) return;
            release();
          });
        });
      });
    }
  }
}
