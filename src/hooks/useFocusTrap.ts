import { useEffect, useRef } from 'react';

interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
  autoFocus?: boolean;
}

/**
 * Robust accessible focus trap hook for modals, sheets, and dialogs.
 * - Traps Tab and Shift+Tab key navigation within the container.
 * - Handles Escape key dismissal.
 * - Restores focus to the previously active element upon unmounting/closing.
 * - Applies body-scroll-lock with iOS Safari support.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isOpen,
  onClose,
  autoFocus = true,
}: UseFocusTrapOptions) {
  const containerRef = useRef<T | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 1. Lock / Unlock Body Scroll
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element before opening
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Save existing body styles
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalTouchAction = document.body.style.touchAction;

    // Prevent background scrolling (including iOS touch devices)
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.touchAction = originalTouchAction;

      // Restore focus
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // 2. Focus Management and Escape Key listener
  useEffect(() => {
    if (!isOpen) return;

    const getFocusableElements = (): HTMLElement[] => {
      if (!containerRef.current) return [];
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      const nodeList = containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(','));
      const elements: HTMLElement[] = [];
      nodeList.forEach((el) => {
        if (!el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true') {
          elements.push(el);
        }
      });
      return elements;
    };

    // Auto-focus the first focusable element inside the modal
    if (autoFocus) {
      requestAnimationFrame(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        } else if (containerRef.current) {
          containerRef.current.focus();
        }
      });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift + Tab -> backwards
          if (document.activeElement === firstElement || document.activeElement === containerRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab -> forwards
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, autoFocus]);

  return containerRef;
}
