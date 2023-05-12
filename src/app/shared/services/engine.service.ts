import * as THREE from 'three';
import { assets } from '../Utils/assets';
import { ElementRef, Injectable, OnDestroy } from '@angular/core';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IAsset, assetTypesEnum, deviceType, deviceTypesEnum, themeType, themeTypesEnum } from './engine.model';
import { Mesh } from 'three';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {
  private assetsObject: IAsset[] = assets;
  public theme: themeType = themeTypesEnum.light;
  private sunLight: THREE.DirectionalLight = new THREE.DirectionalLight("#ffffff", 3);
  private ambientLight: THREE.AmbientLight = new THREE.AmbientLight("#ffffff", 1);
  private room!: GLTF;
  private actualRoom!: THREE.Group;
  private rotation: number = 0;
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
  private cube!: THREE.Mesh;
  private frameId!: number;
  private renderer!: THREE.WebGLRenderer;

  //sizes variables

  private width: number = 0;
  private height: number = 0;
  private aspect: number = 0;
  private pixelRatio: number = 0;
  private frustrum: number = 0;
  private device: deviceType = deviceTypesEnum.desktop;

  private scene!: THREE.Scene;

  //time variables

  private start: number = Date.now();
  private current: number = this.start;
  private elapsed: number = 0;
  private delta: number = 16;

  constructor() { }

  public ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;
    this.scene = new THREE.Scene();
    this.setTime();
    this.setSizes();
    this.createOrthographicCamera();
    this.setRenderer();
    this.setOrbitControls();
    this.setCircles();
    this.setResources();

    this.update();
  }

  public clickToggle(): void {
    this.theme = this.theme === themeTypesEnum.light ? themeTypesEnum.dark : themeTypesEnum.light;
    this.switchTheme();
  }

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

  public setOrbitControls(): void {
    this.controls = new OrbitControls(this.camera, this.canvas);
  }

  setScrollTrigger() {
    ScrollTrigger.matchMedia({
        //Desktop
        "(min-width: 969px)": () => {
            // console.log("fired desktop");

            this.actualRoom.scale.set(0.11, 0.11, 0.11);
            this.camera.position.set(0, 6.5, 10);
            this.actualRoom.position.set(0, 0, 0);
            // First section -----------------------------------------
            const firstMoveTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: ".first-move",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.6,
                    // markers: true,
                    invalidateOnRefresh: true,
                },
            });
            firstMoveTimeline.fromTo(
                this.actualRoom.position,
                { x: 0, y: 0, z: 0 },
                {
                    x: () => {
                        return this.width * 0.0014;
                    },
                }
            );

            // Second section -----------------------------------------
            const secondMoveTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: ".second-move",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                },
            });

            secondMoveTimeline.to(
                this.actualRoom.position,
                {
                    x: () => {
                        return 1;
                    },
                    z: () => {
                        return this.height * 0.0032;
                    },
                },
                "same"
            );
            secondMoveTimeline.to(
                this.actualRoom.scale,
                {
                    x: 0.4,
                    y: 0.4,
                    z: 0.4,
                },
                "same"
            );

          // Third section -----------------------------------------
          const thirdMoveTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".third-move",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
                invalidateOnRefresh: true,
            },
          });
          thirdMoveTimeline.to(this.camera.position, {
              y: 1.5,
              x: -3.1,
          });
        },

        // Mobile
        "(max-width: 968px)": () => {
            // console.log("fired mobile");

            // Resets
            this.actualRoom.scale.set(0.07, 0.07, 0.07);
            this.actualRoom.position.set(0, 0, 0);
            this.camera.position.set(0, 6.5, 10);

            // First section -----------------------------------------
            const firstMoveTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: ".first-move",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.6,
                    // invalidateOnRefresh: true,
                },
            });
            firstMoveTimeline.to(this.actualRoom.scale, {
                x: 0.1,
                y: 0.1,
                z: 0.1,
            });

            // Second section -----------------------------------------
            const secondMoveTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: ".second-move",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.6,
                    invalidateOnRefresh: true,
                },
            });
            secondMoveTimeline.to(
                this.actualRoom.scale,
                {
                    x: 0.25,
                    y: 0.25,
                    z: 0.25,
                },
                "same"
            );
            secondMoveTimeline.to(
                this.actualRoom.position,
                {
                    x: 1.5,
                },
                "same"
            );
            // Third section -----------------------------------------

            const thirdMoveTimeline = gsap.timeline({
              scrollTrigger: {
                  trigger: ".third-move",
                  start: "top top",
                  end: "bottom bottom",
                  scrub: 0.6,
                  invalidateOnRefresh: true,
              },
            });

            thirdMoveTimeline.to(this.actualRoom.position, {
                z: -4.5,
            });
        },

        // all
        all: () => {
          const firstCircle = gsap.timeline({
            scrollTrigger: {
                trigger: ".first-move",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
            },
        }).to(this.circleFirst.scale, {
            x: 3,
            y: 3,
            z: 3,
        });

        // Second section -----------------------------------------
        const secondCircle = gsap.timeline({
            scrollTrigger: {
                trigger: ".second-move",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
            },
        })
            .to(
                this.circleSecond.scale,
                {
                    x: 3,
                    y: 3,
                    z: 3,
                },
                "same"
            )
            .to(
                this.actualRoom.position,
                {
                    y: 0.7,
                },
                "same"
            );

        // Third section -----------------------------------------
        const thirdCircle = gsap.timeline({
            scrollTrigger: {
                trigger: ".third-move",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
            },
        }).to(this.circleThird.scale, {
            x: 3,
            y: 3,
            z: 3,
        });

          const secondPartTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".third-move",
                start: "center center",
            },
          });
          let first: any = [];
          this.actualRoom.children.forEach((child: any) => {
            if (child.name === "Mini_Floor") {
                first.push(gsap.to(child.position, {
                    x: -5.44055,
                    z: 13.6135,
                    duration: 0.4,
                }));
            }
            if (child.name === "Mailbox") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.4,
                }));
            }
            if (child.name === "Lamp") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "back.out(2)",
                    duration: 0.4,
                }));
            }
            if (child.name === "FloorFirst") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "back.out(2)",
                    duration: 0.4,
                }));
            }
            if (child.name === "FloorSecond") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.4,
                }));
            }
            if (child.name === "FloorThird") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "back.out(2)",
                    duration: 0.4,
                }));
            }
            if (child.name === "Dirt") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "back.out(2)",
                    duration: 0.4,
                }));
            }
            if (child.name === "Flower1") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "back.out(2)",
                    duration: 0.4,
                }));
            }
            if (child.name === "Flower2") {
              first.push(gsap.to(child.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    ease: "back.out(2)",
                    duration: 0.4,
                }));
            }
          });
          first.forEach((value: any) => secondPartTimeline.add(value));
        }
    });
}

  public setResources(): void {
    this.assetsObject = assets;
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
    this.room = this.items['room'];
    this.actualRoom = this.room.scene;
    this.scene.add(this.actualRoom);
    this.setFloor();
    
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
      if (child.name === "Cube") {
          // child.scale.set(1, 1, 1);
          child.position.set(0, -1, 0);
          child.rotation.y = Math.PI / 4;
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

  public onMouseMove(): void {
    window.addEventListener("mousemove", (e) => {
        this.rotation =
            ((e.clientX - window.innerWidth / 2) * 2) / window.innerWidth;
        this.lerp.target = this.rotation * 0.05;
    });
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
    this.camera.left = (-this.aspect * this.frustrum) / 2;
    this.camera.right = (this.aspect * this.frustrum) / 2;
    this.camera.top = this.frustrum / 2;
    this.camera.bottom = -this.frustrum / 2;
    
    this.camera.updateProjectionMatrix();

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
