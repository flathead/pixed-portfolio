<script lang="ts">
  import { easterEggs } from '../../lib/state.svelte';

  function close(): void {
    easterEggs.secretMsg = null;
  }

  function handleKey(event: KeyboardEvent): void {
    if (easterEggs.secretMsg && event.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={handleKey} />

{#if easterEggs.secretMsg}
  <button class="msg" type="button" onclick={close} aria-label="Dismiss secret message">
    <div class="msg__head">// secret.txt</div>
    <div class="msg__body">{easterEggs.secretMsg}</div>
    <div class="msg__hint">[click · Esc]</div>
  </button>
{/if}

<style lang="scss">
  @use '../../styles/tokens' as *;

  .msg {
    position: fixed;
    bottom: $space-7;
    left: 50%;
    transform: translateX(-50%);
    z-index: 500;
    background: var(--surface);
    border: 4px solid var(--magenta);
    box-shadow: $shadow-pixel-md var(--magenta-dim);
    padding: $space-4 $space-6;
    text-align: left;
    cursor: pointer;
    animation: px-enter 0.3s steps(8) forwards;
    max-width: min(560px, calc(100vw - var(--space-5)));
    color: var(--text);
    font-family: var(--font-body);
  }

  .msg__head {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--magenta);
    margin-bottom: $space-2;
    letter-spacing: $tracking-pixel;
  }

  .msg__body {
    font-size: $text-base;
    line-height: $leading-normal;
    margin-bottom: $space-2;
  }

  .msg__hint {
    font-family: var(--font-code);
    font-size: $text-xs;
    color: var(--text-muted);
  }
</style>
