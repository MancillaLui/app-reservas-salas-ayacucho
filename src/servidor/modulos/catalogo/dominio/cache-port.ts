export interface CachePort<T> {
  get(load: () => Promise<T>): Promise<T>;
  invalidate(): void;
}
