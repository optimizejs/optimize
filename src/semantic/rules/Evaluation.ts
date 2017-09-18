export class Evaluation {
    private variables: { [name: string]: any } = Object.create(null);

    constructor(private parent?: Evaluation) {
    }

    assign(variable: string, value: any): void {
        this.variables[variable] = value;
    }

    read(variable: string): any {
        if (this.has(variable)) {
            return this.variables[variable];
        }
        return (this.parent as Evaluation).read(variable);
    }

    has(variable: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.variables, variable);
    }

    sub(): Evaluation {
        return new Evaluation(this);
    }

    merge(sub1: Evaluation, sub2: Evaluation): void {
        for (const variable in sub1.variables) {
            if (sub2.has(variable)) {
                const value = sub1.read(variable);
                if (equals(value, sub2.read(variable))) {
                    this.assign(variable, value);
                }
            }
        }
    }
}

function equals(a: any, b: any): boolean {
    return a === b; // todo handle +-0, NaN, domain objects
}
