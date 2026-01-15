"use client";

import { useEffect } from "react";

/**
 * Component to fix hydration mismatches caused by browser extensions
 * Removes attributes added by form filling extensions (e.g., fdprocessedid)
 */
export default function HydrationFixer() {
  useEffect(() => {
    // Remove extension-added attributes that cause hydration mismatches
    const removeExtensionAttrs = () => {
      const extensionAttrs = ['fdprocessedid', 'data-form-io', 'data-dashlane', 'autocomplete'];
      
      document.querySelectorAll('[fdprocessedid], [data-form-io], [data-dashlane]').forEach(el => {
        extensionAttrs.forEach(attr => {
          if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
          }
        });
      });
    };

    // Run immediately
    removeExtensionAttrs();

    // Also watch for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const element = mutation.target as Element;
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
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
