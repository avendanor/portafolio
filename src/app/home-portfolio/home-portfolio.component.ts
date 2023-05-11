import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from '../shared/services/engine.service';

@Component({
  selector: 'home-portfolio',
  templateUrl: './home-portfolio.component.html',
  styleUrls: ['./home-portfolio.component.scss']
})
export class HomePortfolioComponent implements OnInit{
  @ViewChild('rendererCanvas', {static: true}) public rendererCanvas!: ElementRef<HTMLCanvasElement>;

  constructor (private engService: EngineService) {}

  public ngOnInit(): void {
    this.engService.createScene(this.rendererCanvas);
    this.engService.animate();
  }

}
