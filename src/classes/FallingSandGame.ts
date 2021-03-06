import BrushSize from "./BrushSize";
import Color from "./Color";
import Particle from "./Particle";
import ParticleColors from "./ParticleColors";
import ParticleType from "./ParticleType";

export default class FallingSandGame {
  private width = 0;
  private height = 0;
  private framebuffer: Uint8Array;
  private inputBuffer: Array<Particle>;
  private outputBuffer: Array<Particle>;

  constructor(width: number, height: number, framebuffer: Uint8Array) {
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
        if (
          y === 0 ||
          y === this.height - 1 ||
          x === 0 ||
          x === this.width - 1
        ) {
          buffer[index].setType(ParticleType.WALL);
          buffer[index].setUpdated(false);
        }
      }
    }
  }

  private drawToFramebuffer(
    x: number,
    y: number,
    r: number,
    g: number,
    b: number
  ): void {
    const position = y * (this.width * 3) + x * 3;

    this.framebuffer[position] = r;
    this.framebuffer[position + 1] = g;
    this.framebuffer[position + 2] = b;
  }

  private getParticleAt(
    buffer: Array<Particle>,
    x: number,
    y: number
  ): Particle | undefined {
    return buffer[y * this.height + x];
  }

  tick(): void {
    this.clearBuffer(this.outputBuffer);

    this.updateGame();

    this.updateFramebuffer();

    this.swapBuffers();
  }

  private updateGame(): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const currentParticle = this.getParticleAt(this.inputBuffer, x, y);

        if (
          currentParticle?.getType() === ParticleType.EMPTY ||
          currentParticle?.getType() === ParticleType.WALL
        ) {
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

    const down = this.getParticleAt(this.inputBuffer, x, y + 1);
    const downLeft = this.getParticleAt(this.inputBuffer, x - 1, y + 1);
    const downRight = this.getParticleAt(this.inputBuffer, x + 1, y + 1);

    // check for empty spots
    if (down?.getType() === ParticleType.EMPTY) {
      this.getParticleAt(this.outputBuffer, x, y + 1)?.setType(
        currentParticle?.getType() ?? ParticleType.EMPTY
      );
      return;
    } else if (downLeft?.getType() === ParticleType.EMPTY) {
      this.getParticleAt(this.outputBuffer, x - 1, y + 1)?.setType(
        currentParticle?.getType() ?? ParticleType.EMPTY
      );
      return;
    } else if (downRight?.getType() === ParticleType.EMPTY) {
      this.getParticleAt(this.outputBuffer, x + 1, y + 1)?.setType(
        currentParticle?.getType() ?? ParticleType.EMPTY
      );
      return;
    }

    // try to move through water
    if (down?.getType() === ParticleType.WATER) {
      this.getParticleAt(this.outputBuffer, x, y)?.setType(down?.getType());
      this.getParticleAt(this.outputBuffer, x, y + 1)?.setType(
        currentParticle?.getType() ?? ParticleType.EMPTY
      );
      return;
    }

    this.getParticleAt(this.outputBuffer, x, y)?.setType(
      currentParticle?.getType() ?? ParticleType.EMPTY
    );
  }

  private updateWater(x: number, y: number): void {
    const currentParticle = this.getParticleAt(this.inputBuffer, x, y);

    let newX = x;
    let newY = y;

    const left = this.getParticleAt(this.inputBuffer, x - 1, y);
    const right = this.getParticleAt(this.inputBuffer, x + 1, y);
    const down = this.getParticleAt(this.inputBuffer, x, y + 1);
    const downLeft = this.getParticleAt(this.inputBuffer, x - 1, y + 1);
    const downRight = this.getParticleAt(this.inputBuffer, x + 1, y + 1);

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
      newParticle.setType(currentParticle?.getType() ?? ParticleType.EMPTY);
    } else {
      this.getParticleAt(this.outputBuffer, x, y)?.setType(
        currentParticle?.getType() ?? ParticleType.EMPTY
      );
    }
  }

  updateFramebuffer(): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.getParticleAt(this.outputBuffer, x, y);
        const colors: Color =
          current?.color ?? ParticleColors[ParticleType.EMPTY as number];

        this.drawToFramebuffer(x, y, colors.r, colors.g, colors.b);
      }
    }
  }

  private swapBuffers(): void {
    const temp = this.inputBuffer;
    this.inputBuffer = this.outputBuffer;
    this.outputBuffer = temp;
  }

  createParticle(
    x: number,
    y: number,
    type: ParticleType,
    brushSize: BrushSize
  ): void {
    // todo check bounds
    try {
      switch (brushSize as number) {
        case BrushSize.SMALL: {
          const particle = this.getParticleAt(this.inputBuffer, x, y);

          if (type === ParticleType.EMPTY) {
            particle?.clear();
          }

          particle?.setType(type);

          break;
        }
        case BrushSize.MEDIUM: {
          for (let i = -1; i < 2; ++i) {
            const xParticle = this.getParticleAt(this.inputBuffer, x + i, y);
            const yParticle = this.getParticleAt(this.inputBuffer, x, y + i);

            if (type === ParticleType.EMPTY) {
              xParticle?.clear();
              yParticle?.clear();
            }

            xParticle?.setType(type);
            yParticle?.setType(type);
          }

          break;
        }
        case BrushSize.LARGE: {
          for (let i = -3; i < 4; ++i) {
            const xParticle = this.getParticleAt(this.inputBuffer, x + i, y);
            const yParticle = this.getParticleAt(this.inputBuffer, x, y + i);

            if (type === ParticleType.EMPTY) {
              xParticle?.clear();
              yParticle?.clear();
            }

            xParticle?.setType(type);
            yParticle?.setType(type);
          }

          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
