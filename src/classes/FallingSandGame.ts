import Particle from "./Particle";

export default class FallingSandGame {
  width = 420;
  height = 420;
  framebuffer = new Uint8Array(this.height * this.width * 3).fill(0);
  grid = this.createGrid();

  createGrid() {
    return Array.from({ length: this.height }, (e) =>
      Array(this.width).fill(0)
    );
  }

  private updateFramebuffer(x: number, y: number, r: number, g: number, b: number): void {
    const position = y * (this.width * 3) + x * 3;

    this.framebuffer[position] = r;
    this.framebuffer[position + 1] = g;
    this.framebuffer[position + 2] = b;
  }

  tick(): void {
    for (let y = this.height - 1; y >= 0; --y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.grid[y][x];

        const r = current === 0 ? 0 : 194;
        const g = current === 0 ? 0 : 178;
        const b = current === 0 ? 0 : 128;

        this.updateFramebuffer(x, y, r, g, b);

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
    try {
      this.grid[y][x - 1] = 1;
      this.grid[y + 2][x] = 1;
      this.grid[y][x + 1] = 1;
      this.grid[y - 1][x] = 1;
    } catch (error) {
      console.error(error);
    }
  }
}
