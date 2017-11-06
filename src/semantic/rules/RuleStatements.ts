import {CompletionRecord} from '../domain/CompletionRecords';
import {call} from './Basic';
import {Evaluation} from './Evaluation';
import {Executable, VariableVisitor} from './Executable';
import {Optimized} from './Optimized';
import {BackMapper, RuleConstantExpression, RuleExpression} from './RuleExpression';

function flattenOptimize(evaluation: Evaluation, confident: boolean, root: boolean,
                         statements: RuleStatement[]): Optimized<RuleStatement>[] {

    const usedVariables: { [name: string]: boolean } = Object.create(null);

    let canReturn = false;
    const result: Optimized<RuleStatement>[] = [];
    for (const statement of statements) {
        let optimized: Optimized<RuleStatement>;
        if (canReturn) {
            optimized = statement.execute(evaluation, false);
        } else {
            optimized = statement.execute(evaluation, confident);
        }
        const newStatement = optimized.get();
        canReturn = canReturn || newStatement.canReturn();
        if (root) {
            newStatement.visitUsedVariables(variable => usedVariables[variable] = true);
        }
        if (newStatement instanceof RuleBlockStatement) {
            result.push(...newStatement.body.map(st => Optimized.optimized(st)));
        } else {
            result.push(optimized);
        }
    }
    return root ? result.filter(opt => {
        const statement = opt.get();
        return !(statement instanceof RuleLetStatement) || usedVariables[statement.variableName];
    }) : result;
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
            const variable = this.paramNames[i];
            if (param instanceof RuleConstantExpression) {
                evaluation.assign(variable, param.value);
            } else {
                evaluation.assignUnknown(variable);
            }
        }

        const statements = flattenOptimize(evaluation, true, true, this.body);

        return Optimized.wrapIfOptimized(
            statements,
            this,
            () => new RuleFunction(this.paramNames, statements.map(statement => statement.get()))
        );
    }
}

export function inNewScope(statements: RuleStatement[], backMapper?: BackMapper): RuleExpression<CompletionRecord> {
    return call(new RuleFunction([], statements), [], backMapper);
}

export abstract class RuleStatement implements Executable<RuleStatement> {
    st: 1;

    abstract execute(evaluation: Evaluation, confident: boolean): Optimized<RuleStatement>;

    abstract visitUsedVariables(visit: VariableVisitor): void;

    abstract canReturn(): boolean;
}

export class RuleBlockStatement extends RuleStatement {
    constructor(readonly body: RuleStatement[]) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleStatement> {
        const body = flattenOptimize(evaluation, confident, false, this.body);
        return Optimized.wrapIfOptimized(body, this, () => new RuleBlockStatement(body.map(s => s.get())));
        // todo optimize single
    }

    visitUsedVariables(visit: VariableVisitor): void {
        for (const statement of this.body) {
            statement.visitUsedVariables(visit);
        }
    }

    canReturn(): boolean {
        return canReturnAny(this.body);
    }
}

export class RuleLetStatement extends RuleStatement {
    constructor(readonly variableName: string, readonly expression: RuleExpression<any>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleStatement> {
        const optimizedExpression = this.expression.execute(evaluation, confident);
        const expression = optimizedExpression.get();

        if (expression instanceof RuleConstantExpression && confident) {
            evaluation.assign(this.variableName, expression.value);
        } else {
            evaluation.assignUnknown(this.variableName);
        }

        return optimizedExpression.wrapIfOptimized(this, e => new RuleLetStatement(this.variableName, e));
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.expression.visitUsedVariables(visit);
    }

    canReturn(): boolean {
        return false;
    }
}

export class RuleReturn extends RuleStatement {
    constructor(readonly expression: RuleExpression<CompletionRecord>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleStatement> {
        return this.expression.execute(evaluation, confident).wrapIfOptimized(this, e => new RuleReturn(e)); // todo
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.expression.visitUsedVariables(visit);
    }

    canReturn(): boolean {
        return true;
    }
}

export class RuleIfStatement extends RuleStatement {
    constructor(readonly test: RuleExpression<boolean>, private consequent: RuleStatement,
                readonly alternate: RuleStatement) {

        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleStatement> {
        const optimizedTest = this.test.execute(evaluation, confident);
        const test = optimizedTest.get();

        if (test instanceof RuleConstantExpression) {
            if (test.value) {
                return this.consequent.execute(evaluation, confident).asOptimized();
            } else {
                return this.alternate.execute(evaluation, true).asOptimized();
            }
        }

        const consequent = evaluation.sub();
        const optimizedConsequent = this.consequent.execute(consequent, confident);

        const alternate = evaluation.sub();
        const optimizedAlternate = this.alternate.execute(alternate, confident);

        evaluation.merge(consequent, alternate);

        return Optimized.wrapIfOptimized(
            [optimizedTest, optimizedConsequent, optimizedAlternate],
            this,
            () => new RuleIfStatement(test, optimizedConsequent.get(), optimizedAlternate.get())
        );
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.test.visitUsedVariables(visit);
        this.consequent.visitUsedVariables(visit);
        this.alternate.visitUsedVariables(visit);
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
