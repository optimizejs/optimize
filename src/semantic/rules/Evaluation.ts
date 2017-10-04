interface VariableValue {
    known: boolean;
    value?: any;
}

export class Evaluation {
    private variables: { [name: string]: VariableValue } = Object.create(null);

    constructor(private parent?: Evaluation) {
    }

    assign(variable: string, value: any): void {
        this.variables[variable] = {known: true, value};
    }

    assignUnknown(variable: string): void {
        this.variables[variable] = {known: false};
    }

    read(variable: string): any {
        if (this.has(variable)) {
            return this.variables[variable].value;
        }
        return (this.parent as Evaluation).read(variable);
    }

    isKnownValue(variable: string): boolean {
        if (this.has(variable)) {
            return this.variables[variable].known;
        }
        return (this.parent as Evaluation).isKnownValue(variable);
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

    protected has(variable: string): boolean {
        return Object.prototype.hasOwnProperty.call(this.variables, variable);
    }

}

function equals(a: any, b: any): boolean {
    return a === b; // todo handle +-0, NaN, domain objects
}
