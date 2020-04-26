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
import FallingSandGame from "@/classes/FallingSandGame";
import Particle from "@/classes/Particle";

@Component
export default class Game extends Vue {
  sandGame: FallingSandGame = new FallingSandGame();

  context?: CanvasRenderingContext2D = undefined;
  canvas?: HTMLCanvasElement = undefined;

  mouseX = 0;
  mouseY = 0;

  drawing = false;

  interval = 0;
  tickRate = 16; // milliseconds

  mounted(): void {
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    context!.fillStyle = "black";
    this.canvas = canvas;
    this.context = context!;

    this.clearCanvas();

    this.interval = setInterval(() => {
      this.gameLoop();
    }, this.tickRate);
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

    const thickness = 6;
    this.sandGame.createParticle(this.mouseX, this.mouseY);
  }

  clearCanvas(): void {
    this.context?.clearRect(0, 0, this.canvas!.width, this.canvas!.height);
  }

  drawGame(): void {
    this.clearCanvas();

    const imageData = this.context?.getImageData(
      0,
      0,
      this.sandGame.width,
      this.sandGame.height
    );

    for (let y = 0; y < this.sandGame.height; ++y) {
      for (let x = 0; x < this.sandGame.width; ++x) {
        const particle: Particle = this.sandGame.grid[y][x];

        if (particle.empty) {
          continue;
        }

        // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        const position = y * (imageData!.width * 4) + x * 4;
        imageData!.data[position] = 0;
        imageData!.data[position + 1] = 0;
        imageData!.data[position + 2] = 0;
        imageData!.data[position + 3] = 255;
      }
    }

    this.context!.putImageData(imageData!, 0, 0);
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
