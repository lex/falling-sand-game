import Particle from "./Particle";

export default class FallingSandGame {
  width = 640;
  height = 480;
  grid = this.createGrid();

  createGrid() {
    return Array.from({ length: this.height }, (e) =>
      Array(this.width).fill(0)
    );
  }

  tick(): void {
    for (let y = this.height - 1; y >= 0; --y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.grid[y][x];

        if (current === 0) {
          continue;
        }

        // sand
        // fix this it's horrible
        if (current === 1) {
          const atBottom = y === this.height - 1;

          if (atBottom) {
              continue;
          }

          const atLeftEdge = x === 0;
          const atRightEdge = x === this.width - 1;

          const downLeft =
            !atLeftEdge && !atBottom ? this.grid[y + 1][x - 1] : undefined;
          const downRight =
            !atRightEdge && !atBottom ? this.grid[y + 1][x + 1] : undefined;

          if (!this.grid[y + 1][x]) {
            this.grid[y][x] = 0;
            this.grid[y + 1][x] = 1;
          } else if (downLeft === 0) {
            this.grid[y][x] = 0;
            this.grid[y + 1][x - 1] = 1;
          } else if (downRight === 0) {
            this.grid[y][x] = 0;
            this.grid[y + 1][x + 1] = 1;
          }
        }
      }
    }
  }

  createParticle(x: number, y: number): void {
    this.grid[y][x-1] = 1;
    this.grid[y+2][x] = 1;
    this.grid[y][x+1] = 1;
    this.grid[y-1][x] = 1;
  }
}
