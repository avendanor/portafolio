import { Injectable } from '@angular/core';
import { themeType, themeTypesEnum } from './engine.model';
import * as THREE from 'three';
import { gsap } from 'gsap';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public theme!: themeType;
  public sunLight!: THREE.DirectionalLight;
  public ambientLight!: THREE.AmbientLight;

  public switchTheme(): void {
    if (this.theme === themeTypesEnum.dark) {
      gsap.to(this.sunLight.color, {
          r: 0.17254901960784313,
          g: 0.23137254901960785,
          b: 0.6862745098039216,
      });
      gsap.to(this.ambientLight.color, {
          r: 0.17254901960784313,
          g: 0.23137254901960785,
          b: 0.6862745098039216,
      });
      gsap.to(this.sunLight, {
          intensity: 0.78,
      });
      gsap.to(this.ambientLight, {
          intensity: 0.78,
      });
    } else {
      gsap.to(this.sunLight.color, {
          r: 255 / 255,
          g: 255 / 255,
          b: 255 / 255,
      });
      gsap.to(this.ambientLight.color, {
          r: 255 / 255,
          g: 255 / 255,
          b: 255 / 255,
      });
      gsap.to(this.sunLight, {
          intensity: 3,
      });
      gsap.to(this.ambientLight, {
          intensity: 1,
      });
    }
  }
}
