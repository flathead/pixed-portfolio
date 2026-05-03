<script lang="ts">
  import { onMount } from 'svelte';
  import { easterEggs } from '../../lib/state.svelte';

  let canvasRef = $state<HTMLCanvasElement | null>(null);
  let raf = 0;
  let drops: number[] = [];
  let cols = 0;

  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEF0123456789{}[]<>/\\|';
  const CELL = 14;

  function resize(canvas: HTMLCanvasElement): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / CELL);
    drops = new Array(cols).fill(1);
  }

  function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle =
      getComputedStyle(document.documentElement).getPropertyValue('--green').trim() || '#39ff14';
    ctx.font = '13px "IBM Plex Mono", monospace';
    for (let i = 0; i < drops.length; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      ctx.fillText(ch, i * CELL, drops[i] * CELL);
      if (drops[i] * CELL > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  onMount(() => {
    const canvas = canvasRef;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resize(canvas);
    const onResize = (): void => resize(canvas);
    window.addEventListener('resize', onResize);

    const loop = (): void => {
      if (easterEggs.matrixActive) draw(canvas, ctx);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  });

  function dismiss(): void {
    easterEggs.matrixActive = false;
  }
</script>

<canvas
  bind:this={canvasRef}
  class="matrix"
  class:matrix--active={easterEggs.matrixActive}
  onclick={dismiss}
  aria-hidden="true"
></canvas>

<style lang="scss">
  .matrix {
    position: fixed;
    inset: 0;
    z-index: 8000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s steps(10);

    &--active {
      opacity: 1;
      pointer-events: auto;
      cursor: pointer;
    }
  }
</style>
