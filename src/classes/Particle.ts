import Color from "./Color";
import ParticleType from "./ParticleType";
import ParticleColors from "./ParticleColors";

export default class Particle {
  private _type = ParticleType.EMPTY;
  private _updated = false;

  constructor(type: ParticleType) {
    this._type = type;
  }

  get color(): Color {
    return ParticleColors[this._type as number];
  }

  clear(): void {
    this._type = ParticleType.EMPTY;
    this._updated = false;
  }

  getType(): ParticleType {
    return this._type;
  }

  setType(type: ParticleType): void {
    if (!this._updated) {
      this._updated = true;
      this._type = type;
    }
  }

  setUpdated(updated: boolean): void {
    this._updated = updated;
  }
}
