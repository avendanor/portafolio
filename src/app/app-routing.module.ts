import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePortfolioComponent } from './home-portfolio/home-portfolio.component';
import { ProjectsComponent } from './projects/projects.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    redirectTo: 'home'
  },{
    path: 'home',
    component: HomePortfolioComponent
  },{
    path: 'projects',
    component: ProjectsComponent
  },{
    path: 'work',
    component: ProjectsComponent
  },{
    path: 'skills',
    component: ProjectsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
