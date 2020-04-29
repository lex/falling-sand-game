import BrushSize from "./BrushSize";
import ParticleColors from "./ParticleColors";
import ParticleType from "./ParticleType";

export default class FallingSandGame {
  private width = 0;
  private height = 0;
  private framebuffer: Uint8Array;
  private inputBuffer: Uint8Array;
  private outputBuffer: Uint8Array;
  private updateBuffer: Uint8Array;
  private frames = 0;
  private expectedParticleCount = 0;
  private lastParticleCount = 0;

  constructor(width: number, height: number, framebuffer: Uint8Array) {
    this.width = width;
    this.height = height;
    this.framebuffer = framebuffer;
    this.inputBuffer = this.createBuffer();
    this.outputBuffer = this.createBuffer();
    this.updateBuffer = this.createBuffer();
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

  private clearBuffers(): void {
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.height; ++x) {
        const index = y * this.height + x;

        this.outputBuffer[index] = ParticleType.EMPTY;
        this.updateBuffer[index] = ParticleType.EMPTY;

        // generate walls
        if (
          y === 0 ||
          y === this.height - 1 ||
          x === 0 ||
          x === this.width - 1
        ) {
          this.inputBuffer[index] = ParticleType.WALL;
          this.outputBuffer[index] = ParticleType.WALL;
        }
      }
    }
  }

  private particleIndex(x: number, y: number): number {
    return y * this.height + x;
  }

  tick(): void {
    this.clearBuffers();

    this.updateGame();

    this.updateFramebuffer();

    this.swapBuffers();
  }

  private updateGame(): void {
    this.frames++;

    if (this.frames % 60 === 0) {
      console.log(
        `expected: ${this.expectedParticleCount} last: ${this.lastParticleCount}`
      );
    }

    this.lastParticleCount = 0;

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const indexCurrent = this.particleIndex(x, y);
        const updatedCurrent = this.updateBuffer[indexCurrent] !== 0;
        const type = this.inputBuffer[indexCurrent];

        if (
          type === ParticleType.EMPTY ||
          type === ParticleType.WALL ||
          updatedCurrent
        ) {
          continue;
        }

        this.lastParticleCount++;

        const indexDown = this.particleIndex(x, y + 1);
        const indexLeft = this.particleIndex(x - 1, y);
        const indexRight = this.particleIndex(x + 1, y);
        const indexDownLeft = this.particleIndex(x - 1, y + 1);
        const indexDownRight = this.particleIndex(x + 1, y + 1);

        const down = this.inputBuffer[indexDown];
        const left = this.inputBuffer[indexLeft];
        const right = this.inputBuffer[indexRight];
        const downLeft = this.inputBuffer[indexDownLeft];
        const downRight = this.inputBuffer[indexDownRight];

        const updatedDown = this.updateBuffer[indexDown] !== 0;
        const updatedLeft = this.updateBuffer[indexLeft] !== 0;
        const updatedRight = this.updateBuffer[indexRight] !== 0;
        const updatedDownLeft = this.updateBuffer[indexDownLeft] !== 0;
        const updatedDownRight = this.updateBuffer[indexDownRight] !== 0;

        const canMoveDown = down === ParticleType.EMPTY && !updatedDown;
        const canMoveLeft = left === ParticleType.EMPTY && !updatedLeft;
        const canMoveRight = right === ParticleType.EMPTY && !updatedRight;
        const canMoveDownLeft =
          downLeft === ParticleType.EMPTY &&
          left === ParticleType.EMPTY &&
          !updatedDownLeft;
        const canMoveDownRight =
          downRight === ParticleType.EMPTY &&
          right === ParticleType.EMPTY &&
          !updatedDownRight;

        switch (type) {
          case ParticleType.SAND: {
            // check for empty spots
            if (canMoveDown) {
              this.outputBuffer[indexDown] = ParticleType.SAND;
              this.updateBuffer[indexDown] = 1;
            } else if (canMoveDownLeft) {
              this.outputBuffer[indexDownLeft] = ParticleType.SAND;
              this.updateBuffer[indexDownLeft] = 1;
            } else if (canMoveDownRight) {
              this.outputBuffer[indexDownRight] = ParticleType.SAND;
              this.updateBuffer[indexDownRight] = 1;
            } else if (down === ParticleType.WATER && !updatedDown) {
              this.outputBuffer[indexDown] = ParticleType.SAND;
              this.outputBuffer[indexCurrent] = ParticleType.WATER;
              this.updateBuffer[indexDown] = 1;
              this.updateBuffer[indexCurrent] = 1;
            } else {
              this.outputBuffer[indexCurrent] = ParticleType.SAND;
              this.updateBuffer[indexCurrent] = 1;
            }

            break;
          }

          case ParticleType.WATER: {
            if (canMoveDown) {
              this.outputBuffer[indexDown] = ParticleType.WATER;
              this.updateBuffer[indexDown] = 1;
            } else if (canMoveDownLeft) {
              this.outputBuffer[indexDownLeft] = ParticleType.WATER;
              this.updateBuffer[indexDownLeft] = 1;
            } else if (canMoveDownRight) {
              this.outputBuffer[indexDownRight] = ParticleType.WATER;
              this.updateBuffer[indexDownRight] = 1;
            } else if (canMoveLeft) {
              this.outputBuffer[indexLeft] = ParticleType.WATER;
              this.updateBuffer[indexLeft] = 1;
            } else if (canMoveRight) {
              this.outputBuffer[indexRight] = ParticleType.WATER;
              this.updateBuffer[indexRight] = 1;
            } else {
              this.outputBuffer[indexCurrent] = ParticleType.WATER;
              this.updateBuffer[indexCurrent] = 1;
            }

            break;
          }
        }
      }
    }
  }

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
          if (type !== ParticleType.EMPTY) {
            this.expectedParticleCount++;
          }
          break;
        }

        case BrushSize.MEDIUM: {
          for (let i = -1; i < 2; ++i) {
            this.inputBuffer[this.particleIndex(x + i, y + i)] = type;
            if (type !== ParticleType.EMPTY) {
              this.expectedParticleCount++;
            }
          }
          break;
        }

        case BrushSize.LARGE: {
          for (let i = -2; i < 3; ++i) {
            this.inputBuffer[this.particleIndex(x + i, y + i)] = type;
            if (type !== ParticleType.EMPTY) {
              this.expectedParticleCount++;
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}
