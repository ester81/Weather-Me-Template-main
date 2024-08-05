import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  catchError,
  debounceTime,
  finalize,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { LocationService } from 'src/app/core/services/location.service';
import { Location } from 'src/app/shared/models/location.model';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.component.html',
  styleUrls: ['./search.page.component.scss'],
})
export class SearchPageComponent implements OnInit, OnDestroy {
  searchControl: FormControl = new FormControl('Tel Aviv');
  searchResults: Observable<Location[]>;
  selectedResult: Location = {
    Version: 1,
    Key: '215854',
    Type: 'City',
    Rank: 31,
    LocalizedName: 'Tel Aviv',
    Country: {
      ID: 'IL',
      LocalizedName: 'Israel',
    },
    AdministrativeArea: {
      ID: 'TA',
      LocalizedName: 'Tel Aviv',
    },
  };
  showResults = true;
  isCityFavorite = false;
  isLocationLoading = false;
  private searchSubscription: Subscription;

  constructor(
    private locationService: LocationService,
    private favoritesService: FavoritesService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.searchResults = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      tap(() => {
        if (this.selectedResult?.LocalizedName !== this.searchControl.value) {
          this.showResults = true;
          this.selectedResult = null;
        }
      }),
      switchMap((query) => this.search(query)),
      catchError(() => {
        this.showResults = false;
        this.snackBar.open(
          'An error occurred while searching. Please try again.',
          'Close',
          {
            duration: 3000,
          }
        );

        return of([]);
      })
    );

    this.searchSubscription = this.searchResults.subscribe();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  search(query: any): Observable<Location[]> {
    if (!query) {
      return of([]);
    }
    this.loaderService.addRequest();
    this.isLocationLoading = true;
    return this.locationService.getAutocompleteLocation(query).pipe(
      map((results) => {
        if (this.showResults && !results.length) {
          this.snackBar.open('City not found', 'Close', {
            duration: 3000,
          });
        }
        return results;
      }),
      finalize(() => {
        this.loaderService.removeRequest();
        this.isLocationLoading = false;
      })
    );
  }

  selectResult(result: Location) {
    this.selectedResult = result;
    this.isCityFavorite = this.favoritesService.isFavorite(result);
    this.searchControl.setValue(result.LocalizedName, { emitEvent: false });
    this.showResults = false;
  }

  addOrRemoveToFavorites(location: Location) {
    if (this.favoritesService.isFavorite(location)) {
      this.favoritesService.removeFromFavorites(location.Key);
      this.isCityFavorite = false;
    } else {
      this.favoritesService.addToFavorites(location);
      this.isCityFavorite = true;
    }
  }
}
