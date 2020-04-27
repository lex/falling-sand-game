import Color from "./Color";
import Particle from "./Particle";
import ParticleType from "./ParticleType";

export default class FallingSandGame {
  width = 0;
  height = 0;
  framebuffer: Uint8Array;
  grid: Array<Array<Particle>>;

  constructor(width: number, height: number, framebuffer: any) {
    this.width = width;
    this.height = height;
    this.framebuffer = framebuffer;
    this.grid = this.createGrid(width, height);
  }

  createGrid(width: number, height: number) {
    const grid = new Array(height);

    for (let y = 0; y < height; ++y) {
      grid[y] = new Array(width);

      for (let x = 0; x < width; ++x) {
        grid[y][x] = new Particle(ParticleType.EMPTY);
      }
    }

    return grid;
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
        const current = this.grid[y][x] as Particle;
        const colors: Color = current.color;

        this.updateFramebuffer(x, y, colors.r, colors.g, colors.b);

        if (current.type === ParticleType.EMPTY) {
          continue;
        }

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

        switch (current.type as number) {
          case ParticleType.SAND:
            if (this.grid[y + 1][x].type === ParticleType.EMPTY) {
              this.grid[y][x].type = ParticleType.EMPTY;
              this.grid[y + 1][x].type = ParticleType.SAND;
            } else if (downLeft?.type === ParticleType.EMPTY) {
              this.grid[y][x].type = ParticleType.EMPTY;
              this.grid[y + 1][x - 1].type = ParticleType.SAND;
            } else if (downRight?.type === ParticleType.EMPTY) {
              this.grid[y][x].type = ParticleType.EMPTY;
              this.grid[y + 1][x + 1].type = ParticleType.SAND;
            }
            break;
          default:
            break;
        }
      }
    }
  }

  createParticle(x: number, y: number, type: ParticleType): void {
    // todo check bounds
    try {
      this.grid[y][x].type = type;
    } catch (error) {
      console.error(error);
    }
  }
}
