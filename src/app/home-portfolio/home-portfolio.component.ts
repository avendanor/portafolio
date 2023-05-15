import { Component, ElementRef, OnInit, ViewChild, OnDestroy, NgZone} from '@angular/core';
import { AnimationsService } from '../shared/services/animations.service';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IAsset, assetTypesEnum, deviceType, deviceTypesEnum, themeType, themeTypesEnum } from '../shared/services/engine.model';
import { Mesh } from 'three';
import { assets } from '../shared/Utils/assets';
import { ThemeService } from '../shared/services/theme.service';
@Component({
  selector: 'home-portfolio',
  templateUrl: './home-portfolio.component.html',
  styleUrls: ['./home-portfolio.component.scss']
})
export class HomePortfolioComponent implements OnInit, OnDestroy {
  @ViewChild('rendererCanvas', {static: true}) public rendererCanvas!: ElementRef<HTMLCanvasElement>;
  private assetsObject: IAsset[] = assets;
  public themeTypes = themeTypesEnum;
  public theme = themeTypesEnum.light;
  private sunLight = new THREE.DirectionalLight("#ffffff", 3);
  private ambientLight = new THREE.AmbientLight("#ffffff", 1);
  private actualRoom!: THREE.Group;
  private circleFirst!: Mesh;
  private circleSecond!: Mesh;
  private circleThird!: Mesh;
  private lerp = {
    current: 0,
    target: 0,
    ease: 0.1,
  };
  private items!: Record<string, GLTF>;
  private queue: number = 0;
  private loaded: number = 0;
  private loaders!: { gltfLoader: GLTFLoader, dracoLoader: DRACOLoader };
  private controls!: OrbitControls;

  private camera!: THREE.OrthographicCamera;
  private canvas!: HTMLCanvasElement;
  private frameId!: number;
  private renderer!: THREE.WebGLRenderer;

  //sizes variables

  private width: number = 0;
  private height: number = 0;
  private aspect: number = 0;
  private pixelRatio: number = 0;
  private roomSize: number = 0;
  private device: deviceType = deviceTypesEnum.desktop;

  private scene!: THREE.Scene;

  //time variables

  constructor (private animationsService: AnimationsService, private themeService: ThemeService, private zone: NgZone) {}

  public ngOnInit(): void {
    this.canvas = this.rendererCanvas.nativeElement;
    this.scene = new THREE.Scene();
    this.setSizes();
    this.createOrthographicCamera();
    this.setRenderer();
    this.setOrbitControls();
    this.setCircles();
    this.setResources();

    this.themeService.themeObservable.subscribe((value) => {
      this.theme = value;
      this.themeService.switchTheme.apply(this);
    })

    this.update();
  }

  public ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
  }

  public setOrbitControls(): void {
    this.controls = new OrbitControls(this.camera, this.canvas);
  }

  public setResources(): void {
    this.items = {};
    this.queue = this.assetsObject.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  public setLoaders() {
    this.loaders = {
      gltfLoader: new GLTFLoader(),
      dracoLoader: new DRACOLoader()
    };

    this.loaders.dracoLoader.setDecoderPath("assets/draco/");
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader);
  }

  public startLoading() {
    for (const asset of this.assetsObject) {
        if (asset.type === assetTypesEnum.glbModel) {
            this.loaders.gltfLoader.load(asset.path, (file: GLTF) => {
                this.singleAssetLoaded(asset, file);
            });
        }
    }
  }

  public singleAssetLoaded(asset: IAsset, file: GLTF) {
    this.items[asset.name] = file;
    this.loaded++;

    if (this.loaded === this.queue) {
        this.createWorld();
    }
}


  public createWorld() {
    const room = this.items['room'];
    this.actualRoom = room.scene;
    this.scene.add(this.actualRoom);
    this.setFloor();
    
    this.setModel();
    this.onMouseMove();
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

      if (child.name === "Mini_Floor") {
        child.position.x = -0.289521;
        child.position.z = 8.83572;
      }

      if (
        child.name === "Mailbox" ||
        child.name === "Lamp" ||
        child.name === "FloorFirst" ||
        child.name === "FloorSecond" ||
        child.name === "FloorThird" ||
        child.name === "Dirt" ||
        child.name === "Flower1" ||
        child.name === "Flower2"
      ) {
         child.scale.set(0, 0, 0);
      }
      
    });
  }

  public setLights(): void {
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 20;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(-1.5, 7, 3);
    this.scene.add(this.sunLight);
    this.scene.add(this.ambientLight);

    gsap.registerPlugin(ScrollTrigger);

    this.animationsService.setScrollTrigger.apply(this)
  }

  public setSizes():void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.roomSize = 6;
    if (this.width < 968) {
        this.device = deviceTypesEnum.mobile;
    } else {
        this.device = deviceTypesEnum.desktop;
    }

    window.addEventListener("resize", () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.width / this.height;
        this.pixelRatio = Math.min(window.devicePixelRatio, 2);
        this.resize();

        if (this.width < 968 && this.device !== deviceTypesEnum.mobile) {
            this.device = deviceTypesEnum.mobile;
        } else if (this.width >= 968 && this.device !== deviceTypesEnum.desktop) {
            this.device = deviceTypesEnum.desktop;
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

  public createOrthographicCamera(): void {
    this.roomSize = 5.5;
    this.camera = new THREE.OrthographicCamera(
      (-this.aspect * this.roomSize) / 2,
      (this.aspect * this.roomSize) / 2,
      this.roomSize / 2,
      -this.roomSize / 2,
      -200,
      200
    );

    this.camera.position.y = 4;
    this.camera.position.z = 5;
    this.scene.add(this.camera);
  }

  setFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffe6a2,
        side: THREE.BackSide
    });
    const plane = new THREE.Mesh(geometry, material);
    this.scene.add(plane);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -0.3;
    plane.receiveShadow = true;
  }

  setCircles() {
    const geometry = new THREE.CircleGeometry(5, 64);
    const material = new THREE.MeshStandardMaterial({ color: 0xe5a1aa });
    const material2 = new THREE.MeshStandardMaterial({ color: 0x8395cd });
    const material3 = new THREE.MeshStandardMaterial({ color: 0x7ad0ac });

    this.circleFirst = new THREE.Mesh(geometry, material);
    this.circleSecond = new THREE.Mesh(geometry, material2);
    this.circleThird = new THREE.Mesh(geometry, material3);

    this.circleFirst.position.y = -0.29;

    this.circleSecond.position.y = -0.28;
    this.circleSecond.position.x = 2;

    this.circleThird.position.y = -0.27;

    this.circleFirst.scale.set(0, 0, 0);
    this.circleSecond.scale.set(0, 0, 0);
    this.circleThird.scale.set(0, 0, 0);

    this.circleFirst.rotation.x =
        this.circleSecond.rotation.x =
        this.circleThird.rotation.x =
            -Math.PI / 2;

    this.circleFirst.receiveShadow =
        this.circleSecond.receiveShadow =
        this.circleThird.receiveShadow =
            true;

    this.scene.add(this.circleFirst);
    this.scene.add(this.circleSecond);
    this.scene.add(this.circleThird);
  }

  public resize(): void {
    this.camera.left = (-this.aspect * this.roomSize) / 2;
    this.camera.right = (this.aspect * this.roomSize) / 2;
    this.camera.top = this.roomSize / 2;
    this.camera.bottom = -this.roomSize / 2;
    
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  public update(): void {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    window.requestAnimationFrame(() => this.update());

    this.lerp.current = gsap.utils.interpolate(
      this.lerp.current,
      this.lerp.target,
      this.lerp.ease
    );

    if (this.actualRoom) this.actualRoom.rotation.y = this.lerp.current;
  }

  public onMouseMove(): void {
    window.addEventListener("mousemove", (e) => {
        const rotation =
            ((e.clientX - window.innerWidth / 2) * 2) / window.innerWidth;
        this.lerp.target = rotation * 0.05;
    });
  }
}
