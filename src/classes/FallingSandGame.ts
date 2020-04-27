import Color from "./Color";
import Particle from "./Particle";
import ParticleType from "./ParticleType";
import particleColors from './ParticleColors';

export default class FallingSandGame {
  private width = 0;
  private height = 0;
  private framebuffer: Uint8Array;
  private inputBuffer: Array<Particle>;

  constructor(width: number, height: number, framebuffer: any) {
    this.width = width;
    this.height = height;
    this.framebuffer = framebuffer;
    this.inputBuffer = this.createBuffer(width, height);
  }

  private createBuffer(width: number, height: number) {
    const buffer = new Array(width * height);

    for (let i = 0; i < width * height; ++i) {
      buffer[i] = new Particle(ParticleType.EMPTY);
    }

    return buffer;
  }

  private updateFramebuffer(x: number, y: number, r: number, g: number, b: number): void {
    const position = y * (this.width * 3) + x * 3;

    this.framebuffer[position] = r;
    this.framebuffer[position + 1] = g;
    this.framebuffer[position + 2] = b;
  }

  private getParticleAt(buffer: Array<Particle>, x: number, y: number): Particle {
    return buffer[y * this.height + x];
  }

  tick(): void {
    for (let y = this.height - 1; y >= 0; --y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.getParticleAt(this.inputBuffer, x, y);
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

        const left =
          !atLeftEdge ? this.getParticleAt(this.inputBuffer, x - 1, y) : undefined;
        const right =
          !atRightEdge ? this.getParticleAt(this.inputBuffer, x + 1, y) : undefined;
        const down =
          !atBottom ? this.getParticleAt(this.inputBuffer, x, y + 1) : undefined;
        const downLeft =
          !atLeftEdge && !atBottom ? this.getParticleAt(this.inputBuffer, x - 1, y + 1) : undefined;
        const downRight =
          !atRightEdge && !atBottom ? this.getParticleAt(this.inputBuffer, x + 1, y + 1) : undefined;

        switch (current.type as number) {
          case ParticleType.SAND:
            if (down?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              down.type = ParticleType.SAND;
            } else if (downLeft?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              downLeft.type = ParticleType.SAND;
            } else if (downRight?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              downRight.type = ParticleType.SAND;
            }

            break;

          case ParticleType.WATER:
            if (down?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              down.type = ParticleType.WATER;
            } else if (downLeft?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              downLeft.type = ParticleType.WATER;
            } else if (downRight?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              downRight.type = ParticleType.WATER;
            } else if (left?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              left.type = ParticleType.WATER;
            } else if (right?.type === ParticleType.EMPTY) {
              current.type = ParticleType.EMPTY;
              right.type = ParticleType.WATER;
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
      const particle = this.getParticleAt(this.inputBuffer, x, y);
      particle.type = type;
    } catch (error) {
      console.error(error);
    }
  }
}
