<template>
<div>
    <canvas
      v-bind:width="sandGame.width"
      v-bind:height="sandGame.height"
      ref="canvas"
      style="border: 1px solid black;"
    ></canvas>
    <p>{{this.fps}} fps</p>
    <p>{{this.mouseX}},{{this.mouseY}}</p>
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

  private pixiApp!: PIXI.Application;
  private lastMilliseconds = 0;
  private fps = 0;

  private texture = PIXI.Texture.fromBuffer(
    this.sandGame.framebuffer,
    this.sandGame.width,
    this.sandGame.height,
    {
      format: PIXI.FORMATS.RGB,
      type: PIXI.TYPES.UNSIGNED_BYTE,
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

    this.sprite.interactive = true;
    this.pixiApp.renderer.plugins.interaction.moveWhenInside = true;

    this.sprite.on("touchmove", (event: PIXI.interaction.InteractionEvent) => {
      this.mouseX = Math.floor(event.data.global.x);
      this.mouseY = Math.floor(event.data.global.y);
    });

    this.sprite.on("pointermove", (event: PIXI.interaction.InteractionEvent) => {
      this.mouseX = Math.floor(event.data.global.x);
      this.mouseY = Math.floor(event.data.global.y);
    });

    this.sprite.on("touchstart", () => {
      this.drawing = true;
    });

    this.sprite.on("pointerdown", () => {
      this.drawing = true;
    });

    this.sprite.on("pointerup", () => {
      this.drawing = false;
    });

    this.sprite.on("touchend", () => {
      this.drawing = false;
    });

    this.pixiApp.stage.addChild(this.sprite);

    requestAnimationFrame(this.gameLoop);
  }

  destroyed(): void {
    this.texture.destroy();
    this.sprite.destroy();
    this.pixiApp.destroy();
  }

  calculateFPS(): void {
    const millis = Date.now();
    const millisSinceLast = millis - this.lastMilliseconds;
    this.fps = Math.floor(1/(millisSinceLast)*1000);
    this.lastMilliseconds = millis;
  }

  drawSand(): void {
    if (this.drawing) {
      this.sandGame.createParticle(this.mouseX, this.mouseY);
    }
  }

  gameLoop(): void {
    this.calculateFPS();
    this.drawSand();

    this.sandGame.tick();

    this.texture.update();

    requestAnimationFrame(this.gameLoop);
  }

}
</script>

<style scoped lang="scss"></style>
