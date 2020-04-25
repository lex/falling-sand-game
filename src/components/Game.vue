<template>
  <div>
    <canvas
      v-bind:width="canvasWidth"
      v-bind:height="canvasHeight"
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

@Component
export default class Game extends Vue {
  context: CanvasRenderingContext2D | null = null;
  canvas: HTMLCanvasElement | null = null;

  canvasWidth = 640;
  canvasHeight = 480;

  x = 0;
  y = 0;

  drawing = false;

  onClick(event: MouseEvent): void {
    const rect = this.canvas!.getBoundingClientRect();
    console.log(rect);
  }

  mounted(): void {
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    context!.fillStyle = "black";
    this.canvas = canvas;
    this.context = context;
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

    this.x = event.offsetX;
    this.y = event.offsetY;

    this.context!.fillRect(this.x, this.y, 5, 5);
  }
}
</script>

<style scoped lang="scss">
</style>
