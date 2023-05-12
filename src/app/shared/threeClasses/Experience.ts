import * as THREE from "three";
import Time from "../Utils/Time";
import Resources from "../Utils/Resources";
import assets from "../Utils/assets";

import Theme from "./Theme";
import Renderer from "./Renderer";

export default class Experience {
  public canvas!: HTMLCanvasElement;
  public camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  public scene!: THREE.Scene;
  public time: Time = new Time();
  public renderer: Renderer = new Renderer();
  public resources: Resources = new Renderer();
  public theme: Theme = new Theme();

    static instance: any;
    constructor(canvas: HTMLCanvasElement) {
        if (Experience.instance) {
            return Experience.instance;
        }
        Experience.instance = this;
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.resources = new Resources(assets);
    }

    resize() {
        /* this.camera.resize();
        this.renderer.resize(); */
    }

    update() {
        /* this.camera.update();
        this.renderer.update(); */
    }
}
