export function getUserConfig<T>(key: string, parse: (value: string) => T, set: (parsedValue: T) => void): void {
  const value = localStorage.getItem(key);

  // If the value is not set, return
  if (!value) {
    return;
  }

  const parsedValue = parse(value);

  // If the value is not valid, remove it from localStorage and return
  // We can't just use !parsedValue because it will also be false for 0
  if (parsedValue === undefined || parsedValue === null || parsedValue === "" || Number.isNaN(parsedValue)) {
    localStorage.removeItem(key);

    return;
  }

  // If the value is valid, set it
  set(parsedValue);
}

export function setUserConfig(key: string, value: string): void {
  localStorage.setItem(key, value);
}
