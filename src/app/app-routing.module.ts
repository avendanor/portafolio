import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePortfolioComponent } from './home-portfolio/home-portfolio.component';

const routes: Routes = [{
  path: '',
  component: HomePortfolioComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
