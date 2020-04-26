<template>
  <div>
    <canvas
      v-bind:width="sandGame.width"
      v-bind:height="sandGame.height"
      v-on:mousedown="onMouseDown"
      v-on:mouseup="stopDrawing"
      v-on:mouseout="stopDrawing"
      v-on:mousemove="draw"
      ref="canvas"
      style="border: 1px solid black;"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as PIXI from "pixi.js";
import FallingSandGame from "@/classes/FallingSandGame";
import Particle from "@/classes/Particle";

@Component
export default class Game extends Vue {
  private sandGame: FallingSandGame = new FallingSandGame();

  private canvas!: HTMLCanvasElement;

  private mouseX = 0;
  private mouseY = 0;

  private drawing = false;

  interval = 0;
  tickRate = 16; // milliseconds

  private pixiApp!: PIXI.Application;

  private frameBuffer = new Uint8Array(this.sandGame.height * this.sandGame.width * 3).fill(0);

  private texture = PIXI.Texture.fromBuffer(
      this.frameBuffer,
      this.sandGame.width,
      this.sandGame.height,
      {
        format: PIXI.FORMATS.RGB,
        type: PIXI.TYPES.UNSIGNED_BYTE
      }
  );

  private sprite: PIXI.Sprite = PIXI.Sprite.from(this.texture);

  mounted(): void {
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    this.canvas = canvas;

    this.pixiApp = new PIXI.Application({
      width: this.sandGame.width,
      height: this.sandGame.height,
      view: this.canvas,
    });

    this.pixiApp.stage.addChild(this.sprite);

    this.interval = setInterval(() => {
      this.gameLoop();
    }, this.tickRate);
  }

  destroyed(): void {
    clearInterval(this.interval);
    this.texture.destroy();
    this.sprite.destroy();
    this.pixiApp.destroy();
  }

  onMouseDown(event: MouseEvent): void {
    this.drawing = true;
  }

  stopDrawing(event: MouseEvent): void {
    this.drawing = false;
  }

  draw(event: MouseEvent): void {
    if (!this.drawing) {
      return;
    }

    this.mouseX = event.offsetX;
    this.mouseY = event.offsetY;

    this.sandGame.createParticle(this.mouseX, this.mouseY);
  }

  drawGame(): void {
    for (let y = 0; y < this.sandGame.height; ++y) {
      for (let x = 0; x < this.sandGame.width; ++x) {
        const value = this.sandGame.grid[y][x] == 0 ? 0 : 255;

        const position = y * (this.sandGame.width * 3) + x * 3;

        this.frameBuffer[position] = value;
        this.frameBuffer[position + 1] = value;
        this.frameBuffer[position + 2] = value;
      }
    }

    this.texture.update();
  }

  gameLoop(): void {
    this.sandGame.tick();
    // imagine having threads
    this.renderLoop();
  }

  renderLoop(): void {
    this.drawGame();
  }
}
</script>

<style scoped lang="scss"></style>
