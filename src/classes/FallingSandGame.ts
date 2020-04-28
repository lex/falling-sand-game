import Color from "./Color";
import Particle from "./Particle";
import ParticleType from "./ParticleType";

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
    this.fillBuffer(buffer);
    return buffer;
  }

  private fillBuffer(buffer: Array<Particle>): void {
    for (let i = 0; i < this.width * this.height; ++i) {
      buffer[i] = new Particle(ParticleType.EMPTY);
    }
  }

  private clearBuffer(buffer: Array<Particle>): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.height; ++x) {
        const index = y * this.height + x;

        buffer[index].clear();

        // generate walls
        if (y === 0 || y === this.height - 1 || x === 0 || x === this.width - 1) {
          buffer[index].setType(ParticleType.WALL);
          buffer[index].updated = false;
        }
      }
    }
  }

  private drawToFramebuffer(x: number, y: number, r: number, g: number, b: number): void {
    const position = y * (this.width * 3) + x * 3;

    this.framebuffer[position] = r;
    this.framebuffer[position + 1] = g;
    this.framebuffer[position + 2] = b;
  }

  private getParticleAt(buffer: Array<Particle>, x: number, y: number): Particle | undefined {
    return buffer[y * this.height + x];
  }

  tick(): void {
    this.clearBuffer(this.outputBuffer)

    this.updateGame();

    this.updateFramebuffer();

    this.swapBuffers();
  }

  private updateGame(): void {

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const currentParticle = this.getParticleAt(this.inputBuffer, x, y);

        if (currentParticle?.getType() === ParticleType.EMPTY || currentParticle?.getType() === ParticleType.WALL) {
          continue;
        }

        switch (currentParticle?.getType() as number) {
          case ParticleType.SAND:
            this.updateSand(x, y);
            break;

          case ParticleType.WATER:
            this.updateWater(x, y);
            break;

          default:
            break;
        }
      }
    }
  }

  private updateSand(x: number, y: number): void {
    const currentParticle = this.getParticleAt(this.inputBuffer, x, y);

    const down =
      this.getParticleAt(this.inputBuffer, x, y + 1);
    const downLeft =
      this.getParticleAt(this.inputBuffer, x - 1, y + 1);
    const downRight =
      this.getParticleAt(this.inputBuffer, x + 1, y + 1);

    // check for empty spots
    if (down?.getType() === ParticleType.EMPTY) {
      this.getParticleAt(this.outputBuffer, x, y + 1)?.setType(currentParticle!.getType());
      return;
    } else if (downLeft?.getType() === ParticleType.EMPTY) {
      this.getParticleAt(this.outputBuffer, x - 1, y + 1)?.setType(currentParticle!.getType());
      return;
    } else if (downRight?.getType() === ParticleType.EMPTY) {
      this.getParticleAt(this.outputBuffer, x + 1, y + 1)?.setType(currentParticle!.getType());
      return;
    }

    // try to move through water
    if (down?.getType() === ParticleType.WATER) {
      this.getParticleAt(this.outputBuffer, x, y)?.setType(down?.getType());
      this.getParticleAt(this.outputBuffer, x, y + 1)?.setType(currentParticle!.getType())
      return;
    }

    this.getParticleAt(this.outputBuffer, x, y)?.setType(currentParticle!.getType());
  }

  private updateWater(x: number, y: number): void {
    const currentParticle = this.getParticleAt(this.inputBuffer, x, y);

    let newX = x;
    let newY = y;

    const left =
      this.getParticleAt(this.inputBuffer, x - 1, y);
    const right =
      this.getParticleAt(this.inputBuffer, x + 1, y);
    const down =
      this.getParticleAt(this.inputBuffer, x, y + 1);
    const downLeft =
      this.getParticleAt(this.inputBuffer, x - 1, y + 1);
    const downRight =
      this.getParticleAt(this.inputBuffer, x + 1, y + 1);

    if (down?.getType() === ParticleType.EMPTY) {
      newX = x;
      newY = y + 1;
    } else if (downLeft?.getType() === ParticleType.EMPTY) {
      newX = x - 1;
      newY = y + 1;
    } else if (downRight?.getType() === ParticleType.EMPTY) {
      newX = x + 1;
      newY = y + 1;
    } else if (left?.getType() === ParticleType.EMPTY) {
      newX = x - 1;
      newY = y;
    } else if (right?.getType() === ParticleType.EMPTY) {
      newX = x + 1;
      newY = y;
    }

    const newParticle = this.getParticleAt(this.outputBuffer, newX, newY);

    if (newParticle?.getType() === ParticleType.EMPTY) {
      newParticle.setType(currentParticle!.getType());
    } else {
      this.getParticleAt(this.outputBuffer, x, y)?.setType(currentParticle!.getType());
    }
  }

  updateFramebuffer(): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.getParticleAt(this.outputBuffer, x, y);
        const colors: Color = current!.color;

        this.drawToFramebuffer(x, y, colors.r, colors.g, colors.b);
      }
    }
  }

  private swapBuffers(): void {
    const temp = this.inputBuffer;
    this.inputBuffer = this.outputBuffer;
    this.outputBuffer = temp;
  }

  createParticle(x: number, y: number, type: ParticleType): void {
    // todo check bounds
    try {
      this.getParticleAt(this.inputBuffer, x, y)?.setType(type);
      this.getParticleAt(this.inputBuffer, x, y)!.updated = false;
    } catch (error) {
      console.error(error);
    }
  }
}
