export class Optimized<T> {
    static original<T>(item: T): Optimized<T> {
        return new Optimized(item, false);
    }

    static optimized<T>(item: T): Optimized<T> {
        return new Optimized(item, true);
    }

    static wrapIfOptimized<O>(items: Optimized<any>[], original: O, wrapper: () => O): Optimized<O> {
        for (const item of items) {
            if (item.optimized) {
                return new Optimized(wrapper(), true);
            }
        }
        return new Optimized(original, false);
    }

    private constructor(private item: T, private optimized: boolean) {
    }

    isOptimized(): boolean {
        return this.optimized;
    }

    get(): T {
        return this.item;
    }

    wrapIfOptimized<O>(original: O, wrapper: (t: T) => O): Optimized<O> {
        // return Optimized.wrapIfOptimized([this], original,) TODO?
        return new Optimized(this.optimized ? wrapper(this.item) : original, this.optimized);
    }

    asOptimized(): Optimized<T> {
        return this.optimized ? this : new Optimized(this.item, true);
    }
}
