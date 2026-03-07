export function getUserConfig(key: string, callback: (value: string) => void): void {
  const value = localStorage.getItem(key);

  if (value) {
    callback(value);
  }
}

export function setUserConfig(key: string, value: string): void {
  localStorage.setItem(key, value);
}
