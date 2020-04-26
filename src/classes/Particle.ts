export default class Particle {
    x = 0;
    y = 0;
    empty = true;

    constructor(x: number, y: number, empty: boolean) {
        this.x = x;
        this.y = y;
        this.empty = empty;
    }
}
