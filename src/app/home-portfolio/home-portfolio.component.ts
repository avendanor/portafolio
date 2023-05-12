import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from '../shared/services/engine.service';
import { themeType, themeTypesEnum } from '../shared/services/engine.model';

@Component({
  selector: 'home-portfolio',
  templateUrl: './home-portfolio.component.html',
  styleUrls: ['./home-portfolio.component.scss']
})
export class HomePortfolioComponent implements OnInit{
  @ViewChild('rendererCanvas', {static: true}) public rendererCanvas!: ElementRef<HTMLCanvasElement>;
  public toggleValue: themeType = themeTypesEnum.light;
  public themeTypes = themeTypesEnum;

  constructor (private engService: EngineService) {}

  public ngOnInit(): void {
    this.engService.createScene(this.rendererCanvas);
    /* this.engService.animate(); */
  }

  public clickToggle(): void {
    this.engService.clickToggle();
    this.toggleValue = this.engService.theme;
  }
}
