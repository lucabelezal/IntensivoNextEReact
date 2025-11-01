import { useEffect } from 'react';
import '@/styles/globals.css';
import 'tailwindcss/tailwind.css';

function App({ Component, pageProps }) {
  useEffect(() => {
    // Limpa qualquer seleção que possa ocorrer por long-press
    const clearSelectionIfNotEditable = (e) => {
      try {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        const sel = window.getSelection && window.getSelection();
        if (sel && sel.rangeCount) sel.removeAllRanges();
      } catch (err) {
        // noop
      }
    };

    document.addEventListener('touchend', clearSelectionIfNotEditable, { passive: true });
    document.addEventListener('mouseup', clearSelectionIfNotEditable);

    return () => {
      document.removeEventListener('touchend', clearSelectionIfNotEditable);
      document.removeEventListener('mouseup', clearSelectionIfNotEditable);
    };
  }, []);

  return <Component {...pageProps} />;
}

export default App;
