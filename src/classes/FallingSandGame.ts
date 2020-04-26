import Particle from "./Particle"

export default class FallingSandGame {
    width = 640;
    height = 480;
    grid = this.createGrid()

    createGrid() {
        return Array.from({length: this.height}, e => Array(this.width).fill(0.0));
    }

    tick(): void {
        return;
    }

    createParticle(x: number, y: number): void {
        this.grid[y][x] = 1;
        console.log(`created particle at ${x},${y}`);
    }
}
