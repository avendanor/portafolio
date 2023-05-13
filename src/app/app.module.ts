import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePortfolioComponent } from './home-portfolio/home-portfolio.component';
import { MainComponent } from './main/main.component';

@NgModule({
  declarations: [	
    AppComponent,
    HomePortfolioComponent,
      MainComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
