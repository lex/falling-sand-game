import Color from "./Color";
import Particle from "./Particle";
import ParticleType from "./ParticleType";
import particleColors from './ParticleColors';

export default class FallingSandGame {
  private width = 0;
  private height = 0;
  private framebuffer: Uint8Array;
  private inputBuffer: Array<Particle>;
  private outputBuffer: Array<Particle>;

  constructor(width: number, height: number, framebuffer: any) {
    this.width = width;
    this.height = height;
    this.framebuffer = framebuffer;
    this.inputBuffer = this.createBuffer();
    this.outputBuffer = this.createBuffer();
  }

  private createBuffer(): Array<Particle> {
    const buffer = new Array(this.width * this.height);

    this.clearBuffer(buffer);

    return buffer;
  }

  private clearBuffer(buffer: Array<Particle>): void {
    for (let i = 0; i < this.width * this.height; ++i) {
      buffer[i] = new Particle(ParticleType.EMPTY);
    }
  }

  private drawToFramebuffer(x: number, y: number, r: number, g: number, b: number): void {
    const position = y * (this.width * 3) + x * 3;

    this.framebuffer[position] = r;
    this.framebuffer[position + 1] = g;
    this.framebuffer[position + 2] = b;
  }

  private getParticleAt(buffer: Array<Particle>, x: number, y: number): Particle {
    return buffer[y * this.height + x];
  }

  tick(): void {
    this.clearBuffer(this.outputBuffer)

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.getParticleAt(this.inputBuffer, x, y);

        if (current.type === ParticleType.EMPTY) {
          continue;
        }

        const atBottom = y === this.height - 1;

        if (atBottom) {
          this.getParticleAt(this.outputBuffer, x, y).type = current.type;
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

        let newX = x;
        let newY = y;

        switch (current.type as number) {
          case ParticleType.SAND:
            if (down?.type === ParticleType.EMPTY) {
              newX = x;
              newY = y + 1;
            } else if (downLeft?.type === ParticleType.EMPTY) {
              newX = x - 1;
              newY = y + 1;
            } else if (downRight?.type === ParticleType.EMPTY) {
              newX = x + 1;
              newY = y + 1;
            }

            break;

          case ParticleType.WATER:
            if (down?.type === ParticleType.EMPTY) {
              newX = x;
              newY = y + 1;
            } else if (downLeft?.type === ParticleType.EMPTY) {
              newX = x - 1;
              newY = y + 1;
            } else if (downRight?.type === ParticleType.EMPTY) {
              newX = x + 1;
              newY = y + 1;
            } else if (left?.type === ParticleType.EMPTY) {
              newX = x - 1;
              newY = y;
            } else if (right?.type === ParticleType.EMPTY) {
              newX = x + 1;
              newY = y;
            }

            break;

          default:
            break;
        }

        const newParticle = this.getParticleAt(this.outputBuffer, newX, newY);

        if (newParticle.type === ParticleType.EMPTY) {
          newParticle.type = current.type;
        } else {
          this.getParticleAt(this.outputBuffer, x, y).type = current.type;
        }
      }
    }


    this.updateFramebuffer();

    const temp = this.inputBuffer;
    this.inputBuffer = this.outputBuffer;
    this.outputBuffer = temp;
  }

  updateFramebuffer(): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.getParticleAt(this.outputBuffer, x, y);
        const colors: Color = current.color;

        this.drawToFramebuffer(x, y, colors.r, colors.g, colors.b);
      }
    }
  }

  createParticle(x: number, y: number, type: ParticleType): void {
    // todo check bounds
    try {
      this.getParticleAt(this.inputBuffer, x, y).type = type;
    } catch (error) {
      console.error(error);
    }
  }
}
