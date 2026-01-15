/**
 * Utility to suppress hydration warnings from browser extensions
 * Some extensions add attributes like 'fdprocessedid' that cause mismatches
 */
export const suppressHydrationWarning = () => {
  if (typeof document !== 'undefined') {
    // Clean up extension-added attributes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target) {
          const element = mutation.target as Element;
          // Remove common browser extension attributes
          const extensionAttrs = ['fdprocessedid', 'data-form-io', 'data-dashlane'];
          extensionAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
              element.removeAttribute(attr);
            }
          });
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['fdprocessedid', 'data-form-io', 'data-dashlane'],
      subtree: true,
      attributeOldValue: false,
    });

    return () => observer.disconnect();
  }
};
