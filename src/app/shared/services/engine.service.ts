import * as THREE from 'three';
import assets from '../Utils/assets';
import { ElementRef, Injectable, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {
  //theme variables
  public theme: string = "light";
  public toggleButton = document.querySelector(".toggle-button");
  public toggleCircle = document.querySelector(".toggle-circle");
  //environment variables
  sunLight: THREE.DirectionalLight = new THREE.DirectionalLight("#ffffff", 3);
  ambientLight: THREE.AmbientLight = new THREE.AmbientLight("#ffffff", 1);
  //room variables
  room: any;
  actualRoom: any;
  rotation: number = 0;
  lerp = {
    current: 0,
    target: 0,
    ease: 0.1,
  };

  // resources variables
  private assets!: any;
  public items: any = {};
  public queue: number = 0;
  public loaded: number = 0;
  public loaders: any = {};

  public controls!: OrbitControls;
  public timeline!: gsap.core.Timeline;

  private camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private canvas!: HTMLCanvasElement;
  private cube!: THREE.Mesh;
  private frameId!: number;
  private isPerspective = false;
  private renderer!: THREE.WebGLRenderer;

  //sizes variables

  private width: number = 0;
  private height: number = 0;
  private aspect: number = 0;
  private pixelRatio: number = 0;
  private frustrum: number = 0;
  private device: string = "desktop";

  private scene!: THREE.Scene;

  //time variables

  public start: number = Date.now();
  public current: number = this.start;
  public elapsed: number = 0;
  public delta: number = 16;

  constructor(private ngZone: NgZone) { }

  public ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;
    this.scene = new THREE.Scene();
    this.setTime();
    this.setSizes();
    this.isPerspective ? this.createPerspectiveCamera() : this.createOrthographicCamera();
    this.setRenderer();
    this.setResources();
    this.setFloor();
    this.setOrbitControls();
    /* this.createWorld(); */

    this.update();

    /* this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light); */
  }

  public clickToggle(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.switchTheme();
  }

  public switchTheme(): void {
    if (this.theme === "dark") {
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

  public setOrbitControls(): void {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enableZoom = true;
  }

  public setScrollTrigger(): void {
    this.timeline = gsap.timeline();
    this.timeline.to(this.actualRoom.position, {
      x: () => {
        return this.width * 0.0012
      },
      scrollTrigger: {
        trigger: ".first-move",
        markers: true,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });
  }

  public setResources(): void {
    this.assets = assets;
    this.items = {};
    this.queue = this.assets.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  public setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.dracoLoader = new DRACOLoader();
    this.loaders.dracoLoader.setDecoderPath("assets/draco/");
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);
  }

  public startLoading() {
    for (const asset of this.assets) {
        if (asset.type === "glbModel") {
            this.loaders.gltfLoader.load(asset.path, (file: any) => {
                this.singleAssetLoaded(asset, file);
            });
        }
    }
  }

  public singleAssetLoaded(asset: any, file: any) {
    this.items[asset.name] = file;
    this.loaded++;

    if (this.loaded === this.queue) {
        this.createWorld();
    }
}


  public createWorld() {
    this.room = this.items.room;
    this.actualRoom = this.room.scene;
    this.scene.add(this.actualRoom);
    
    this.setModel();
    this.onMouseMove();
    this.actualRoom.scale.set(0.11, 0.11, 0.11);
    this.setLights();
  }

  public setModel(): void {
    this.actualRoom.children.forEach((child: any) => {
      child.castShadow = true;
      child.receiveShadow = true;
      
      if (child instanceof THREE.Group) {
        child.children.forEach((groupchild) => {
            groupchild.castShadow = true;
            groupchild.receiveShadow = true;
        });
      }

      if (child.name === "Aquarium") {
        // console.log(child);
        child.children[0].material = new THREE.MeshPhysicalMaterial();
        child.children[0].material.roughness = 0;
        child.children[0].material.color.set(0x54b0d2);
        child.children[0].material.ior = 1;
        child.children[0].material.transmission = 1;
        child.children[0].material.opacity = 0.1;
        child.children[0].material.depthWrite = false;
        child.children[0].material.depthTest = false;
      }
    });
  }

  public setLights(): void {
    this.sunLight = new THREE.DirectionalLight("#ffffff", 3);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 20;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(-1.5, 7, 3);
    this.scene.add(this.sunLight);

    this.ambientLight = new THREE.AmbientLight("#ffffff", 1);
    this.scene.add(this.ambientLight);

    gsap.registerPlugin(ScrollTrigger);

    this.setScrollTrigger();
  }

  public setTime(): void {
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16;
  }

  public setSizes():void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.frustrum = 5;
    if (this.width < 968) {
        this.device = "mobile";
    } else {
        this.device = "desktop";
    }

    window.addEventListener("resize", () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.resize();

        if (this.width < 968 && this.device !== "mobile") {
            this.device = "mobile";
            /* this.emit("switchdevice", this.device); */
        } else if (this.width >= 968 && this.device !== "desktop") {
            this.device = "desktop";
            /* this.emit("switchdevice", this.device); */
        }
    });
  }

  public setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 0.5;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  public onMouseMove(): void {
    window.addEventListener("mousemove", (e) => {
        this.rotation =
            ((e.clientX - window.innerWidth / 2) * 2) / window.innerWidth;
        this.lerp.target = this.rotation * 0.5;
    });
}

  public createPerspectiveCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75, this.aspect, 0.1, 1000
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

    this.camera.position.y = 4;
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    /* const size = 20;
    const divisions = 20;

    const gridHelper = new THREE.GridHelper(size, divisions);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(10);
    this.scene.add(axesHelper); */
  }

  setFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffe6a2,
        side: THREE.BackSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    this.scene.add(plane);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -0.3;
    plane.receiveShadow = true;
}

  /* public animate(): void {
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
  } */

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
      (<THREE.PerspectiveCamera> this.camera).aspect = this.aspect;
      this.camera.updateProjectionMatrix();
    } else {
      (<THREE.OrthographicCamera> this.camera).left =
          (-this.aspect * this.frustrum) / 2;
      (<THREE.OrthographicCamera> this.camera).right =
          (this.aspect * this.frustrum) / 2;
      (<THREE.OrthographicCamera> this.camera).top = this.frustrum / 2;
      (<THREE.OrthographicCamera> this.camera).bottom = -this.frustrum / 2;
      
      this.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  public update(): void {
    this.renderer.render(this.scene, this.camera);
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;
    this.controls.update();
    window.requestAnimationFrame(() => this.update());

    this.lerp.current = gsap.utils.interpolate(
      this.lerp.current,
      this.lerp.target,
      this.lerp.ease
    );

    if (this.actualRoom) this.actualRoom.rotation.y = this.lerp.current;
  }
}
