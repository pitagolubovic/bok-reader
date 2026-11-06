// src/hooks/usePage.tsx
import { useState, useLayoutEffect, RefObject } from "react";

export default function usePage(containerRef: RefObject<Element | null>) {
  // Start with initial state
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    noOfPages: 1,
  });

  // A layout effect, so the size is known before the first paint and the
  // book can be laid out once, at its final size.
  useLayoutEffect(() => {
    const containerElement = containerRef?.current; // Use optional chaining for safety

    const updatePageDimensions = () => {
      if (containerElement) {
        const rect = containerElement.getBoundingClientRect();
        const isLandscape = rect.height < rect.width;
        // Only update state if dimensions actually change to avoid infinite loops
        setDimensions((prev) => {
          const newWidth = isLandscape ? rect.width / 2 : rect.width;
          const newHeight = rect.height;
          const newNoOfPages = isLandscape ? 2 : 1;
          if (
            prev.width !== newWidth ||
            prev.height !== newHeight ||
            prev.noOfPages !== newNoOfPages
          ) {
            return {
              width: newWidth,
              height: newHeight,
              noOfPages: newNoOfPages,
            };
          }
          return prev; // No change
        });
      } else {
        // Reset if element disappears
        setDimensions({ width: 0, height: 0, noOfPages: 1 });
      }
    };

    if (containerElement) {
      updatePageDimensions(); // Calculate initial dimensions once element exists
      const resizeObserver = new ResizeObserver(updatePageDimensions);
      resizeObserver.observe(containerElement);
      return () => {
        resizeObserver.unobserve(containerElement);
      };
    }
    // If containerElement is null initially, the effect will re-run when
    // the ref object's .current property is populated by React,
    // triggering a state update in the parent, causing Book to re-render,
    // and this effect runs again.
  }, [containerRef]); // Dependency on the ref object itself

  // Return the current state
  return [dimensions.width, dimensions.height, dimensions.noOfPages];
}
