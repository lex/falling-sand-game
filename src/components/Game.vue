<template>
  <div>
    <canvas
      v-bind:width="canvasWidth"
      v-bind:height="canvasHeight"
      ref="canvas"
      style="border: 1px solid black;"
    ></canvas>
    <div>
      <p>{{ particleTypeName }}</p>
      <Button v-on:click="onSandClicked">sand</Button>
      <Button v-on:click="onWaterClicked">water</Button>
      <Button v-on:click="onEmptyClicked">empty</Button>
    </div>
    <div>
      <p>{{ brushSizeName }}</p>
      <Button v-on:click="onBrushSelected(0)">small</Button>
      <Button v-on:click="onBrushSelected(1)">medium</Button>
      <Button v-on:click="onBrushSelected(2)">large</Button>
    </div>

    <p>{{ this.fps }} fps</p>

    <Button v-on:click="onPauseClicked">
      {{ paused ? "resume" : "pause" }}
    </Button>

    <div v-if="paused">
      <p>PAUSED</p>
      <Button v-on:click="onStepClicked">step</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as PIXI from "pixi.js";
import FallingSandGame from "@/classes/FallingSandGame";
import ParticleType from "@/classes/ParticleType";
import BrushSize from "@/classes/BrushSize";

@Component
export default class Game extends Vue {
  private gameWidth = 120;
  private gameHeight = 120;

  private framebuffer = new Uint8Array(
    this.gameHeight * this.gameWidth * 3
  ).fill(0);

  private sandGame: FallingSandGame = new FallingSandGame(
    this.gameWidth,
    this.gameHeight,
    this.framebuffer
  );

  private particleType: ParticleType = ParticleType.SAND;
  private brushSize = BrushSize.SMALL;

  private canvasScale = 4;
  private canvasWidth = this.gameWidth * this.canvasScale;
  private canvasHeight = this.gameHeight * this.canvasScale;

  private canvas!: HTMLCanvasElement;

  private mouseX = 0;
  private mouseY = 0;

  private drawing = false;

  private pixiApp!: PIXI.Application;
  private lastMilliseconds = 0;

  private fps = 0;
  private paused = false;

  private texture = PIXI.Texture.fromBuffer(
    this.framebuffer,
    this.gameWidth,
    this.gameHeight,
    {
      format: PIXI.FORMATS.RGB,
      type: PIXI.TYPES.UNSIGNED_BYTE
    }
  );

  private sprite: PIXI.Sprite = PIXI.Sprite.from(this.texture);

  mounted(): void {
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    this.canvas = canvas;

    this.setupPixi();
    this.bindInputEvents();

    requestAnimationFrame(this.gameLoop);
  }

  setupPixi(): void {
    this.pixiApp = new PIXI.Application({
      width: this.canvasWidth,
      height: this.canvasHeight,
      view: this.canvas
    });

    this.sprite.interactive = true;

    this.sprite.setTransform(0, 0, this.canvasScale, this.canvasScale);
    this.pixiApp.renderer.plugins.interaction.moveWhenInside = true;

    this.pixiApp.stage.addChild(this.sprite);
  }

  bindInputEvents(): void {
    this.sprite.on("touchmove", this.onTouchPointerMove);
    this.sprite.on("pointermove", this.onTouchPointerMove);
    this.sprite.on("touchstart", this.startDrawing);
    this.sprite.on("touchend", this.stopDrawing);
    this.sprite.on("pointerdown", this.startDrawing);
    this.sprite.on("pointerup", this.stopDrawing);
  }

  onTouchPointerMove(event: PIXI.interaction.InteractionEvent): void {
    this.mouseX = Math.floor(event.data.global.x / this.canvasScale);
    this.mouseY = Math.floor(event.data.global.y / this.canvasScale);
  }

  startDrawing(): void {
    this.drawing = true;
  }

  stopDrawing(): void {
    this.drawing = false;
  }

  destroyed(): void {
    this.texture.destroy();
    this.sprite.destroy();
    this.pixiApp.destroy();
  }

  calculateFPS(): void {
    const millis = Date.now();
    const millisSinceLast = millis - this.lastMilliseconds;
    this.fps = Math.floor((1 / millisSinceLast) * 1000);
    this.lastMilliseconds = millis;
  }

  drawSand(): void {
    if (this.drawing) {
      this.sandGame.createParticle(this.mouseX, this.mouseY, this.particleType, this.brushSize);
    }
  }

  gameLoop(): void {
    this.calculateFPS();
    this.drawSand();

    if (!this.paused) {
      this.sandGame.tick();
    }

    this.texture.update();

    requestAnimationFrame(this.gameLoop);
  }

  onPauseClicked() {
    this.paused = !this.paused;
  }

  onStepClicked() {
    this.sandGame.tick();
  }

  onSandClicked() {
    this.particleType = ParticleType.SAND;
  }

  onWaterClicked() {
    this.particleType = ParticleType.WATER;
  }

  onEmptyClicked() {
    this.particleType = ParticleType.EMPTY;
  }

  get particleTypeName(): string {
    return ParticleType[this.particleType];
  }

  get brushSizeName(): string {
    return BrushSize[this.brushSize];
  }

  onBrushSelected(size: BrushSize) {
    this.brushSize = size;
  }
}
</script>

<style scoped lang="scss"></style>
