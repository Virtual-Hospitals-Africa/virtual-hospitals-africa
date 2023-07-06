// deno-lint-ignore-file no-explicit-any
type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel: () => void;
};

export default function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = function (...args: any[]) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, wait);
  } as unknown as DebouncedFunction<T>;

  debounced.cancel = function () {
    clearTimeout(timeoutId);
  };

  return debounced;
}