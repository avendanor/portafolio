import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePortfolioComponent } from './home-portfolio/home-portfolio.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    redirectTo: 'home'
  },{
    path: 'home',
    component: HomePortfolioComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
