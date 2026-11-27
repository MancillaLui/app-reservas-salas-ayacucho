export class Cache<T> {
  private value?: T;
  private expires = 0;
  private generation = 0;
  constructor(private readonly ttl = 30_000, private readonly now = Date.now) {}
  async get(load: () => Promise<T>): Promise<T> {
    if (this.value !== undefined && this.now() < this.expires) return this.value;
    const generation = this.generation;
    const value = await load();
    if (generation === this.generation) { this.value = value; this.expires = this.now() + this.ttl; }
    return value;
  }
  invalidate() { this.generation++; this.value = undefined; this.expires = 0; }
}
