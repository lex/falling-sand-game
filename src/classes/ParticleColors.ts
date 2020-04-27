import Color from "./Color";
import ParticleType from "./ParticleType";

const particleColors = {
    [ParticleType.EMPTY as number]: new Color(0, 0, 0),
    [ParticleType.SAND as number]: new Color(194, 178, 128),
    [ParticleType.WATER as number]: new Color(128, 197, 222)
};

export default particleColors;