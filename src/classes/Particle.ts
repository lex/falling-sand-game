import Color from "./Color";
import ParticleType from "./ParticleType";
import ParticleColors from "./ParticleColors";

export default class Particle {
    private _type = ParticleType.EMPTY;
    updated = false;

    constructor(type: ParticleType) {
        this.type = type;
    }

    get color(): Color {
        return ParticleColors[this.type as number];
    }

    get type(): ParticleType {
        return this._type;
    }

    set type(type: ParticleType) {
        if (!this.updated) {
            this.updated = true;
            this._type = type;
        }
    }
}
