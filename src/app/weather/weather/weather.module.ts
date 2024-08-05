import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SearchPageComponent } from './pages/search/search.page.component';
import { CoreModule } from 'src/app/core/core.module';
import { WeatherPageComponent } from './pages/weather/weather.page.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SearchPageComponent, WeatherPageComponent],
  imports: [CommonModule, SharedModule, CoreModule],
})
export class WeatherModule {}
