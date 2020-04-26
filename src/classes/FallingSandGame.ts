import Particle from "./Particle"

export default class FallingSandGame {
    width = 640;
    height = 480;
    grid = this.createGrid()

    createGrid() {
        const grid = Array.from({length: this.height}, e => Array(this.width).fill(0));

        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                grid[y][x] = new Particle(x, y, true);
            }
        }

        return grid;
    }

    tick(): void {
        return;
    }

    createParticle(x: number, y: number): void {
        const particle: Particle = this.grid[y][x];
        particle.empty = false;
        console.log(`created particle at ${JSON.stringify(particle)}`);
    }
}
