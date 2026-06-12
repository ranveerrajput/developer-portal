import { useEffect } from 'react';

import { useCommandPaletteStore } from '@/store/command-palette-store';

export function SearchHotkeys() {
  const toggle = useCommandPaletteStore((state) => state.toggle);
  const close = useCommandPaletteStore((state) => state.close);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggle();
        return;
      }

      if (event.key === 'Escape') {
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, toggle]);

  return null;
}
