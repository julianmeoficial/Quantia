const PREFIX = "quantia-draft:";

/** Borradores de formularios. Nunca guardar tokens ni datos de sesión. */
export function saveDraft(key: string, value: string) {
  sessionStorage.setItem(PREFIX + key, value);
}

export function readDraft(key: string): string | null {
  return sessionStorage.getItem(PREFIX + key);
}

export function clearDrafts() {
  const keys: string[] = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach((key) => sessionStorage.removeItem(key));
}
