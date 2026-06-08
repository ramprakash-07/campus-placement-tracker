/**
 * useDebounce — debounces a value by a specified delay.
 *
 * @param {any} value — the value to debounce
 * @param {number} delay — delay in milliseconds (default 300)
 * @returns {any} the debounced value
 */
import { useState, useEffect } from "react";

export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
