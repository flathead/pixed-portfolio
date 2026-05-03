<script lang="ts">
  import { onMount } from 'svelte';
  import { easterEggs } from '../../lib/state.svelte';
  import { SECRETS, matchKonami, matchTyped, registerConsoleCommands } from '../../lib/easter-eggs';

  const TYPED_BUFFER_LIMIT = 12;
  const KEY_BUFFER_LIMIT = 12;

  let typedBuffer = '';
  let keyBuffer: string[] = [];

  function isInputTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (isInputTarget(event.target)) return;

    keyBuffer = [...keyBuffer, event.code].slice(-KEY_BUFFER_LIMIT);
    if (matchKonami(keyBuffer)) {
      easterEggs.konamiOpen = true;
      keyBuffer = [];
      return;
    }

    if (event.key.length === 1) {
      typedBuffer = (typedBuffer + event.key).slice(-TYPED_BUFFER_LIMIT);
      if (matchTyped(typedBuffer, 'flathead')) {
        easterEggs.secretMsg = SECRETS.flathead;
        typedBuffer = '';
        return;
      }
      if (matchTyped(typedBuffer, 'matrix')) {
        easterEggs.matrixActive = !easterEggs.matrixActive;
        typedBuffer = '';
        return;
      }
    }
  }

  onMount(() => {
    registerConsoleCommands();
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>
