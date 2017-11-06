import {Evaluation} from '../rules/Evaluation';
import {VariableVisitor} from '../rules/Executable';
import {Optimized} from '../rules/Optimized';
import {RuleExpression} from '../rules/RuleExpression';
import {CompletionRecord} from './CompletionRecords';

export abstract class EnvironmentRecord {
    env: true;
}

class GetBindingValueExpression extends RuleExpression<CompletionRecord> { // todo abstract ternary expression
    constructor(private er: RuleExpression<EnvironmentRecord>, private name: RuleExpression<string>,
                private isStrict: RuleExpression<boolean>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<CompletionRecord>> {
        const er = this.er.execute(evaluation, confident);
        const name = this.name.execute(evaluation, confident);
        const isStrict = this.isStrict.execute(evaluation, confident);

        return Optimized.wrapIfOptimized(
            [er, name, isStrict],
            this,
            () => new GetBindingValueExpression(er.get(), name.get(), isStrict.get())
        );
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.er.visitUsedVariables(visit);
        this.name.visitUsedVariables(visit);
        this.isStrict.visitUsedVariables(visit);
    }
}

export function getBindingValue(er: RuleExpression<EnvironmentRecord>, name: RuleExpression<string>,
                                isStrict: RuleExpression<boolean>): RuleExpression<CompletionRecord> {

    return new GetBindingValueExpression(er, name, isStrict);
}
