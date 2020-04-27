import Color from "./Color";
import ParticleType from "./ParticleType";
import ParticleColors from "./ParticleColors";

export default class Particle {
    type = ParticleType.EMPTY;

    constructor(type: ParticleType) {
        this.type = type;
    }

    get color(): Color {
        return ParticleColors[this.type as number];
    }
}
