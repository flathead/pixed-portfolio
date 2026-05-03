<script lang="ts">
  import { onMount } from 'svelte';
  import { themeState } from '../../lib/state.svelte';
  import {
    THEMES,
    THEME_KEYS,
    applyTheme,
    readStoredTheme,
    writeStoredTheme,
    type ThemeKey,
  } from '../../lib/themes';

  let open = $state(false);
  let menuRef = $state<HTMLDivElement | null>(null);

  onMount(() => {
    themeState.theme = readStoredTheme(window.localStorage);
  });

  function pick(key: ThemeKey): void {
    themeState.theme = key;
    applyTheme(key, document.documentElement);
    writeStoredTheme(window.localStorage, key);
  }

  function handleDocumentClick(event: MouseEvent): void {
    if (!open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (menuRef && !menuRef.contains(target)) {
      open = false;
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') open = false;
  }
</script>

<svelte:window onmousedown={handleDocumentClick} onkeydown={handleKeydown} />

<div class="theme-tweaker" bind:this={menuRef}>
  <button
    class="theme-tweaker__btn"
    class:theme-tweaker__btn--active={open}
    type="button"
    aria-label="Theme settings"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    ⚙
  </button>

  {#if open}
    <div class="theme-tweaker__menu" role="menu">
      <div class="theme-tweaker__title">// THEME</div>
      {#each THEME_KEYS as key (key)}
        {@const def = THEMES[key]}
        {@const active = themeState.theme === key}
        <button
          class="theme-tweaker__option"
          class:theme-tweaker__option--active={active}
          type="button"
          role="menuitemradio"
          aria-checked={active}
          onclick={() => pick(key)}
        >
          <span class="theme-tweaker__swatches" aria-hidden="true">
            {#each def.swatches as color (color)}
              <span class="theme-tweaker__swatch" style:background={color}></span>
            {/each}
          </span>
          <span class="theme-tweaker__label">{def.label}</span>
          {#if active}
            <span class="theme-tweaker__check" aria-hidden="true">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../styles/tokens' as *;

  .theme-tweaker {
    position: relative;
  }

  .theme-tweaker__btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: $text-base;
    cursor: pointer;
    padding: $space-1;
    transition:
      color 80ms steps(2),
      transform 200ms steps(8);

    &:hover,
    &--active {
      color: var(--green);
    }

    &--active {
      transform: rotate(90deg);
    }
  }

  .theme-tweaker__menu {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    z-index: 60;
    min-width: 240px;
    background: var(--surface);
    border: 4px solid var(--border);
    box-shadow: $shadow-pixel-md var(--border);
    padding: $space-3;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  .theme-tweaker__title {
    font-family: var(--font-display);
    font-size: $text-xs;
    color: var(--green);
    letter-spacing: $tracking-pixel;
    text-transform: uppercase;
    margin-bottom: $space-2;
  }

  .theme-tweaker__option {
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: $space-2 $space-3;
    background: transparent;
    border: 2px solid var(--border);
    color: var(--text);
    font-family: var(--font-code);
    font-size: $text-sm;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 80ms steps(2),
      background 80ms steps(2);

    &:hover {
      border-color: var(--cyan);
    }

    &--active {
      border-color: var(--green);
      background: var(--surface-2);
      color: var(--green);
    }
  }

  .theme-tweaker__swatches {
    display: flex;
    gap: 2px;
  }

  .theme-tweaker__swatch {
    width: 14px;
    height: 14px;
    border: 1px solid rgba(0, 0, 0, 0.4);
  }

  .theme-tweaker__label {
    flex: 1;
  }

  .theme-tweaker__check {
    color: var(--green);
  }
</style>
