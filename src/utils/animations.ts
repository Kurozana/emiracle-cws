/**
 * Animation utilities for Emiracle CWS
 * Helper functions for managing animations
 */

/**
 * Initialize scroll-triggered animations
 * Call this on page load
 */
export function initScrollAnimations(): void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Add staggered animation delays to children
 * @param container - Parent element selector
 * @param baseDelay - Starting delay in ms
 * @param increment - Delay increment between items in ms
 */
export function staggerChildren(
  container: string,
  baseDelay: number = 0,
  increment: number = 100
): void {
  const parent = document.querySelector(container);
  if (!parent) return;

  Array.from(parent.children).forEach((child, index) => {
    (child as HTMLElement).style.animationDelay = `${baseDelay + index * increment}ms`;
  });
}

/**
 * Trigger a one-time animation on an element
 * @param element - Element or selector
 * @param animationClass - CSS animation class to apply
 */
export function triggerAnimation(
  element: HTMLElement | string,
  animationClass: string
): void {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) return;

  el.classList.add(animationClass);
  el.addEventListener(
    'animationend',
    () => {
      el.classList.remove(animationClass);
    },
    { once: true }
  );
}

/**
 * Parse and inject custom animation CSS
 * Use this to dynamically add animation templates
 * @param cssString - Raw CSS string containing animations
 */
export function injectAnimationCSS(cssString: string): void {
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-custom-animations', '');
  styleElement.textContent = cssString;
  document.head.appendChild(styleElement);
}
