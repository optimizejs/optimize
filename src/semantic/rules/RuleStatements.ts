import {CompletionRecord} from '../domain/CompletionRecords';
import {RuleConstantExpression} from './Basic';
import {Evaluation} from './Evaluation';
import {Executable} from './Executable';
import {Optimized} from './Optimized';
import {RuleExpression} from './RuleExpression';

function flattenOptimize(evaluation: Evaluation, statements: RuleStatement[]): Optimized<RuleStatement>[] {
    let canReturn = false;
    const result: Optimized<RuleStatement>[] = [];
    for (const statement of statements) {
        let optimized: Optimized<RuleStatement>;
        if (canReturn) {
            optimized = Optimized.original(statement);
        } else {
            optimized = statement.execute(evaluation);
        }
        const newStatement = optimized.get();
        canReturn = canReturn || newStatement.canReturn();
        if (newStatement instanceof RuleBlockStatement) {
            result.push(...newStatement.body.map(st => Optimized.optimized(st)));
        } else {
            result.push(optimized);
        }
    }
    return result;
}

function canReturnAny(statements: RuleStatement[]): boolean {
    for (const statement of statements) {
        if (statement.canReturn()) {
            return true;
        }
    }
    return false;
}

export class RuleFunction {
    constructor(private paramNames: string[], readonly body: RuleStatement[]) {
    }

    call(params: RuleExpression<any>[]): Optimized<RuleFunction> {
        const evaluation = new Evaluation();
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (param instanceof RuleConstantExpression) {
                evaluation.assign(this.paramNames[i], param.value);
            }
        }

        const statements = flattenOptimize(evaluation, this.body);

        return Optimized.wrapIfOptimized(
            statements,
            this,
            () => new RuleFunction(this.paramNames, statements.map(statement => statement.get()))
        );
    }
}

export abstract class RuleStatement implements Executable<RuleStatement> {
    st: 1;

    abstract execute(evaluation: Evaluation): Optimized<RuleStatement>;

    abstract canReturn(): boolean;
}

export class RuleBlockStatement extends RuleStatement {
    constructor(readonly body: RuleStatement[]) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleStatement> {
        const body = flattenOptimize(evaluation, this.body);
        return Optimized.wrapIfOptimized(body, this, () => new RuleBlockStatement(body.map(s => s.get())));
        // todo optimize single
    }

    canReturn(): boolean {
        return canReturnAny(this.body);
    }
}

export class RuleLetStatement extends RuleStatement {
    constructor(readonly variableName: string, readonly expression: RuleExpression<any>) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleStatement> {
        const optimizedExpression = this.expression.execute(evaluation);
        const expression = optimizedExpression.get();

        if (expression instanceof RuleConstantExpression) {
            evaluation.assign(this.variableName, expression.value);
        }

        return optimizedExpression.wrapIfOptimized(this, e => new RuleLetStatement(this.variableName, e));
    }

    canReturn(): boolean {
        return false;
    }
}

export class RuleReturn extends RuleStatement {
    constructor(readonly expression: RuleExpression<CompletionRecord>) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleStatement> {
        return this.expression.execute(evaluation).wrapIfOptimized(this, e => new RuleReturn(e)); // todo
    }

    canReturn(): boolean {
        return true;
    }
}

export class RuleIfStatement extends RuleStatement {
    constructor(private test: RuleExpression<boolean>, private consequent: RuleStatement,
                private alternate: RuleStatement) {

        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleStatement> {
        const optimizedTest = this.test.execute(evaluation);
        const test = optimizedTest.get();

        if (test instanceof RuleConstantExpression) {
            if (test.value) {
                return this.consequent.execute(evaluation).asOptimized();
            } else {
                return this.alternate.execute(evaluation).asOptimized();
            }
        }

        const consequent = evaluation.sub();
        const optimizedConsequent = this.consequent.execute(consequent);

        const alternate = evaluation.sub();
        const optimizedAlternate = this.alternate.execute(alternate);

        evaluation.merge(consequent, alternate);

        return Optimized.wrapIfOptimized(
            [optimizedTest, optimizedConsequent, optimizedAlternate],
            this,
            () => new RuleIfStatement(test, optimizedConsequent.get(), optimizedAlternate.get())
        );
    }

    canReturn(): boolean {
        return this.consequent.canReturn() || this.alternate.canReturn();
    }
}

export class RuleEmptyStatement extends RuleBlockStatement {
    constructor() {
        super([]);
    }
}
