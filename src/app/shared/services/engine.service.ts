import * as THREE from 'three';
import { ElementRef, Injectable, NgZone, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {
  private canvas!: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private scene!: THREE.Scene;
  private light!: THREE.AmbientLight;
  private aspect!: number;

  private cube!: THREE.Mesh;

  private frameId!: number;

  private isPerspective = true;

  constructor(private ngZone: NgZone) { }

  public ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });

    this.aspect = window.innerWidth / window.innerHeight;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.isPerspective ? this.createPerspectiveCamera() : this.createOrthographicCamera();

    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);
  }

  public createPerspectiveCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );

    this.camera.position.z = 5;
    this.scene.add(this.camera);
  }

  public createOrthographicCamera(): void {
    const frustrum = 5;
    this.camera = new THREE.OrthographicCamera(
      (-this.aspect * frustrum) / 2,
      (this.aspect * frustrum) / 2,
      frustrum / 2,
      -frustrum / 2,
      -100,
      100
    );

    this.camera.position.z = 5;
    this.scene.add(this.camera);
  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        })
      }

      window.addEventListener('resize', () => {
        this.resize();
      })
    })
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    if (this.isPerspective) {
      const width = window.innerWidth;
      const height = window.innerHeight;

      (<THREE.PerspectiveCamera> this.camera).aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    }
  }
}
