import * as THREE from 'three';
import { assets } from '../Utils/assets';
import { Injectable } from '@angular/core';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IAsset, deviceType, deviceTypesEnum, themeType, themeTypesEnum } from './engine.model';
import { Mesh } from 'three';

@Injectable({
  providedIn: 'root'
})
export class AnimationsService {
  public theme: themeType = themeTypesEnum.light;
  private actualRoom!: THREE.Group;
  private circleFirst!: Mesh;
  private circleSecond!: Mesh;
  private circleThird!: Mesh;
  private camera!: THREE.OrthographicCamera;
  private width: number = 0;
  private height: number = 0;

  setScrollTrigger() {
    ScrollTrigger.matchMedia({
        //Desktop
        "(min-width: 969px)": () => {
            this.actualRoom.scale.set(0.11, 0.11, 0.11);
            this.camera.position.set(0, 6.5, 10);
            this.actualRoom.position.set(0, 0, 0.5);
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
                { x: 0, y: 0, z: 0.5 },
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
                scrub: 1,
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
                scrub: 1,
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
                scrub: 1,
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
}
