import { useEffect, useState } from "react";

export function useSyncedLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  // Update localStorage when value changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        setValue(event.newValue ? JSON.parse(event.newValue) : defaultValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, defaultValue]);

  return [value, setValue];
}