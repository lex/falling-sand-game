import BrushSize from "./BrushSize";
import Color from "./Color";
import Particle from "./Particle";
import ParticleColors from "./ParticleColors";
import ParticleType from "./ParticleType";

export default class FallingSandGame {
  private width = 0;
  private height = 0;
  private framebuffer: Uint8Array;
  private inputBuffer: Uint8Array;
  private outputBuffer: Uint8Array;

  constructor(width: number, height: number, framebuffer: Uint8Array) {
    this.width = width;
    this.height = height;
    this.framebuffer = framebuffer;
    this.inputBuffer = this.createBuffer();
    this.outputBuffer = this.createBuffer();
  }

  private createBuffer(): Uint8Array {
    const buffer = new Uint8Array(this.width * this.height);
    this.fillBuffer(buffer);
    return buffer;
  }

  private fillBuffer(buffer: Uint8Array): void {
    for (let i = 0; i < this.width * this.height; ++i) {
      buffer[i] = ParticleType.EMPTY;
    }
  }

  private clearBuffer(buffer: Uint8Array): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.height; ++x) {
        const index = y * this.height + x;

        buffer[index] = ParticleType.EMPTY;

        // generate walls
        if (
          y === 0 ||
          y === this.height - 1 ||
          x === 0 ||
          x === this.width - 1
        ) {
          buffer[index] = ParticleType.WALL;
        }
      }
    }
  }

  private particleIndex(x: number, y: number): number {
    return y * this.height + x;
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
        const type = this.inputBuffer[this.particleIndex(x, y)];

        if (type === ParticleType.EMPTY || type === ParticleType.WALL) {
          continue;
        }

        const left = this.inputBuffer[this.particleIndex(x - 1, y)];
        const right = this.inputBuffer[this.particleIndex(x + 1, y)];
        const down = this.inputBuffer[this.particleIndex(x, y + 1)];
        const downLeft = this.inputBuffer[this.particleIndex(x - 1, y + 1)];
        const downRight = this.inputBuffer[this.particleIndex(x + 1, y + 1)];

        switch (type) {
          case ParticleType.SAND: {
            // check for empty spots
            if (down === ParticleType.EMPTY) {
              this.outputBuffer[this.particleIndex(x, y + 1)] =
                ParticleType.SAND;
            } else if (downLeft === ParticleType.EMPTY) {
              this.outputBuffer[this.particleIndex(x - 1, y + 1)] =
                ParticleType.SAND;
            } else if (downRight === ParticleType.EMPTY) {
              this.outputBuffer[this.particleIndex(x + 1, y + 1)] =
                ParticleType.SAND;
            } else {
              this.outputBuffer[this.particleIndex(x, y)] = ParticleType.SAND;
            }

            break;

            // try to move through water
            // if (down?.getType() === ParticleType.WATER) {
            //   this.getParticleAt(this.outputBuffer, x, y)!.setType(
            //     down?.getType()
            //   );
            //   this.getParticleAt(this.outputBuffer, x, y + 1)?.setType(
            //     currentParticle?.getType() ?? ParticleType.EMPTY
            //   );
            //   break;
            // }

            // this.getParticleAt(this.outputBuffer, x, y)?.setType(
            //   ParticleType.SAND
            // );
            // break;
          }
          case ParticleType.WATER: {
            if (down === ParticleType.EMPTY) {
              this.outputBuffer[this.particleIndex(x, y + 1)] =
                ParticleType.WATER;
            } else if (downLeft === ParticleType.EMPTY) {
              this.inputBuffer[this.particleIndex(x - 1, y + 1)] =
                ParticleType.WATER;
            } else if (downRight === ParticleType.EMPTY) {
              this.inputBuffer[this.particleIndex(x + 1, y + 1)] =
                ParticleType.WATER;
            } else if (left === ParticleType.EMPTY) {
              this.inputBuffer[this.particleIndex(x - 1, y)] =
                ParticleType.WATER;
            } else if (right === ParticleType.EMPTY) {
              this.inputBuffer[this.particleIndex(x + 1, y)] =
                ParticleType.WATER;
            } else {
              this.outputBuffer[this.particleIndex(x, y)] = ParticleType.WATER;
            }

            break;
          }
        }
      }
    }
  }

  // private updateWater(x: number, y: number): void {
  //   const currentParticle = this.getParticleAt(this.inputBuffer, x, y);

  //   let newX = x;
  //   let newY = y;

  //   const newParticle = this.getParticleAt(this.outputBuffer, newX, newY);

  //   if (newParticle?.getType() === ParticleType.EMPTY) {
  //     newParticle.setType(currentParticle?.getType() ?? ParticleType.EMPTY);
  //   } else {
  //     this.getParticleAt(this.outputBuffer, x, y)?.setType(
  //       currentParticle?.getType() ?? ParticleType.EMPTY
  //     );
  //   }
  // }

  updateFramebuffer(): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const current = this.outputBuffer[this.particleIndex(x, y)];
        const colorIndex = current * 3; // rgb, 3 bytes per color
        const position = y * (this.width * 3) + x * 3;

        this.framebuffer[position] = ParticleColors[colorIndex];
        this.framebuffer[position + 1] = ParticleColors[colorIndex + 1];
        this.framebuffer[position + 2] = ParticleColors[colorIndex + 2];
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
          this.inputBuffer[this.particleIndex(x, y)] = type;
          break;
        }
        case BrushSize.MEDIUM: {
          for (let i = -1; i < 2; ++i) {
            this.inputBuffer[this.particleIndex(x + i, y + i)] = type;
          }
          break;
        }

        case BrushSize.LARGE: {
          for (let i = -2; i < 3; ++i) {
            this.inputBuffer[this.particleIndex(x + i, y + i)] = type;
          }
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
