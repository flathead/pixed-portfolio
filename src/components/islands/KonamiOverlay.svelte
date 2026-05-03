<script lang="ts">
  import { easterEggs } from '../../lib/state.svelte';

  function close(): void {
    easterEggs.konamiOpen = false;
  }

  function handleKey(event: KeyboardEvent): void {
    if (!easterEggs.konamiOpen) return;
    if (event.key === 'Escape' || event.key === 'Enter') close();
  }
</script>

<svelte:window onkeydown={handleKey} />

{#if easterEggs.konamiOpen}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Cheat code activated"
    onclick={close}
    onkeydown={handleKey}
    tabindex="-1"
  >
    <div class="overlay__box" role="alert">
      <div class="overlay__title">CHEAT CODE</div>
      <div class="overlay__sub">GODMODE ENABLED</div>
      <div class="overlay__body">
        +99 к PHP · +99 к Laravel<br />
        +99 к кофе · +99 к удаче<br />
        Ты нашёл пасхалку. Уважение.
      </div>
      <div class="overlay__hint">[click anywhere · Esc · Enter]</div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use '../../styles/tokens' as *;

  .overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.92);
    cursor: pointer;
  }

  .overlay__box {
    background: var(--surface);
    border: 4px solid var(--green);
    box-shadow:
      0 0 40px var(--green),
      $shadow-pixel-lg var(--green-dim);
    padding: $space-7 $space-9;
    text-align: center;
    animation: levelup 0.4s steps(8) forwards;
    cursor: default;
  }

  .overlay__title {
    font-family: var(--font-display);
    font-size: $text-xl;
    color: var(--green);
    text-shadow: 0 0 20px var(--green);
    margin-bottom: $space-3;
    letter-spacing: $tracking-pixel;
  }

  .overlay__sub {
    font-family: var(--font-display);
    font-size: $text-base;
    color: var(--yellow);
    margin-bottom: $space-4;
    letter-spacing: $tracking-pixel;
  }

  .overlay__body {
    font-family: var(--font-body);
    font-size: $text-lg;
    color: var(--text);
    line-height: $leading-normal;
    margin-bottom: $space-5;
    max-width: 360px;
  }

  .overlay__hint {
    font-family: var(--font-code);
    font-size: $text-sm;
    color: var(--text-muted);
  }
</style>
