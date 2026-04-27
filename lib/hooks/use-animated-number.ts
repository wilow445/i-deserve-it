"use client";

import { useEffect, useRef, useState } from "react";
import { easeOutExpo } from "../utils";

export function useAnimatedNumber(target: number, duration = 1000) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  valueRef.current = value;

  useEffect(() => {
    let raf: number;
    const from = valueRef.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(from + (target - from) * easeOutExpo(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
