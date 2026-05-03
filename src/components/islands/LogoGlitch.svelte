<script lang="ts">
  import { easterEggs } from '../../lib/state.svelte';
  import { SECRETS } from '../../lib/easter-eggs';

  interface Props {
    href?: string;
    text: string;
  }

  let { href = '/', text }: Props = $props();

  let clicks = $state(0);
  let glitching = $state(false);
  let glitchTimer = 0;

  function handleClick(event: MouseEvent): void {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    clicks += 1;
    glitching = true;
    window.clearTimeout(glitchTimer);
    glitchTimer = window.setTimeout(() => (glitching = false), 400);

    if (clicks >= 5) {
      event.preventDefault();
      easterEggs.secretMsg = SECRETS.logoFive;
      clicks = 0;
    }
  }
</script>

<a {href} class="brand" class:brand--glitching={glitching} data-text={text} onclick={handleClick}>
  <span class="brand__bracket">[</span>
  <span class="brand__name">{text}</span>
  <span class="brand__bracket">]</span>
  {#if clicks > 0 && clicks < 5}
    <span class="brand__hint">{5 - clicks}...</span>
  {/if}
</a>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .brand {
    position: relative;
    display: inline-flex;
    align-items: baseline;
    gap: $space-1;
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    letter-spacing: $tracking-pixel;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
  }

  .brand__bracket {
    color: var(--green);
  }

  .brand__name {
    color: var(--text);
    transition: color 80ms steps(2);
  }

  .brand:hover .brand__name {
    color: var(--cyan);
  }

  .brand__hint {
    font-family: var(--font-code);
    font-size: 9px;
    color: var(--text-muted);
    margin-left: $space-2;
  }

  .brand--glitching::before,
  .brand--glitching::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .brand--glitching::before {
    color: var(--magenta);
    animation: glitch1 0.3s steps(2) infinite;
  }

  .brand--glitching::after {
    color: var(--cyan);
    animation: glitch2 0.3s steps(2) 0.1s infinite;
  }
</style>
