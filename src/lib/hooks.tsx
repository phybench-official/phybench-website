import type { DependencyList, EffectCallback } from "react";
import { useEffect, useRef } from "react";

export function useOnMountUnsafe(
  effect: EffectCallback,
  deps?: DependencyList,
) {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      effect();
    }
  }, deps);
}
