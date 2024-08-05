import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, Subject, takeUntil } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader.service';
import { WeatherService } from 'src/app/core/services/weather.service';
import { CurrentWeather } from 'src/app/shared/models/currentWeather.model';
import { Forecast } from 'src/app/shared/models/forecast.model';
import { Location } from 'src/app/shared/models/location.model';
import { Temperature } from 'src/app/shared/models/temperature.model';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.page.component.html',
  styleUrls: ['./weather.page.component.scss'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [animate('500ms ease-in', style({ opacity: 1 }))]),
    ]),
  ],
})
export class WeatherPageComponent implements OnInit, OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() location: Location;
  weather: CurrentWeather;
  temperature: Temperature;
  forecast: Forecast;
  isWeatherLoading = false;
  constructor(
    public weatherService: WeatherService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.loadWeather();
    this.weatherService.temperatureUnitChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.temperature = this.weatherService.isMetric
          ? this.weather.Temperature.Metric
          : this.weather.Temperature.Imperial;
        this.loadForcast();
      });
    this.loaderService.stateChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        this.isWeatherLoading = isLoading;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.location &&
      changes.location.currentValue !== changes.location.previousValue
    ) {
      this.loadWeather();
    }
  }

  loadWeather() {
    this.loaderService.addRequest();
    this.weatherService
      .getCurrentWeather(this.location.Key)
      .pipe(finalize(() => this.loaderService.removeRequest()))
      .subscribe({
        next: (weather) => {
          this.weather = weather[0];
          this.temperature = this.weatherService.isMetric
            ? this.weather.Temperature.Metric
            : this.weather.Temperature.Imperial;
        },
        error: (error) => {
          this.snackBar.open('Failed to load weather', 'Close', {
            duration: 3000,
          });
        },
      });
    this.loadForcast();
  }

  loadForcast() {
    this.loaderService.addRequest();
    this.weatherService
      .getForecast(this.location.Key)
      .pipe(finalize(() => this.loaderService.removeRequest()))
      .subscribe({
        next: (forecast) => {
          this.forecast = forecast;
        },
        error: (error) => {
          this.snackBar.open('Failed to load forecast', 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
