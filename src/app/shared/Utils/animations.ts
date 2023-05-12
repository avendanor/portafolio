import * as THREE from "three";

export default class Animations {
    constructor() {
    }
}
export const chipUtils = {
  getCategoryPath(fullPath: string): string {
    const separator = '>>';
    const path = fullPath.split(separator);

    path.pop();

    return path.length >= 1 ? `${path.join(separator)}${separator}` : '';
  },
  getChipName(fullPath: string): string {
    const path = fullPath.split('>>');
    const category = path[path.length - 1].trim();

    return path.length >= 2
      ? `${path[path.length - 2].trim()}\xa0>>\xa0${category}`
      : category;
  }
};
