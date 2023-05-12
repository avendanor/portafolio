import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

// assets
export enum assetTypesEnum {
  glbModel = 'glbModel'
}

export interface IAsset { 
  name: string; 
  type: assetType; 
  path: string; 
}

export type assetType = 'glbModel';

// theme

export enum themeTypesEnum {
  light = 'LIGHT',
  dark = 'DARK'
}

export type themeType = 'LIGHT' | 'DARK';

// device 
export enum deviceTypesEnum {
  mobile = 'MOBILE',
  desktop = 'DESKTOP'
}

export type deviceType = 'MOBILE' | 'DESKTOP';
