import { Component } from '@angular/core';
import { WeatherService } from './core/services/weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  displayLoading = false;

  constructor(private weatherService: WeatherService) {}

  changeTemperatureUnit() {
    this.weatherService.isMetric = !this.weatherService.isMetric;
    this.weatherService.temperatureUnitChanged.next(null);
  }

  toggleTheme(isDarkTheme: boolean): void {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.removeItem('theme');
    }
  }
}
