import {Evaluation} from '../../rules/Evaluation';
import {VariableVisitor} from '../../rules/Executable';
import {RuleExpression} from '../../rules/expression/RuleExpression';
import {constant, NoVarExpression} from '../../rules/expression/RuleNoVarExpresion';
import {Optimized} from '../../rules/Optimized';
import {CompletionRecord} from '../CompletionRecords';
import {JSValue, Type} from './JSValue';
import {FunctionCreation} from '../../nodes/NodeHelper';

type ObjectProvider = () => any;

export class ObjectValue extends JSValue {
    objectValue: true;

    constructor(readonly payload: any) {
        super();
    }

    getType(): Type {
        return Type.OBJECT;
    }
}

class RuleNewObjectExpression<T> extends NoVarExpression<ObjectValue> {
    constructor(readonly provider: ObjectProvider) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<ObjectValue>> {
        const payload = this.provider();
        return Optimized.optimized(constant(new ObjectValue(payload)));
    }
}

class RuleCallGetExpression extends RuleExpression<CompletionRecord> {
    constructor(private obj: RuleExpression<ObjectValue>, private property: RuleExpression<string>,
                private thisValue: RuleExpression<ObjectValue>) {
        super();
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<CompletionRecord>> {
        const obj = this.obj.execute(evaluation, confident);
        const property = this.property.execute(evaluation, confident);
        const thisValue = this.thisValue.execute(evaluation, confident);

        return Optimized.wrapIfOptimized(
            [obj, property, thisValue],
            this,
            () => new RuleCallGetExpression(obj.get(), property.get(), thisValue.get())
        );
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.obj.visitUsedVariables(visit);
        this.property.visitUsedVariables(visit);
        this.thisValue.visitUsedVariables(visit);
    }
}

export function callGet(obj: RuleExpression<ObjectValue>, property: RuleExpression<string>,
                        thisValue: RuleExpression<ObjectValue>): RuleExpression<CompletionRecord> {

    return new RuleCallGetExpression(obj, property, thisValue);
}

export function newObject(payload: any): RuleExpression<ObjectValue> {
    return new RuleNewObjectExpression(() => payload);
}

export function newFunction(fc: FunctionCreation): RuleExpression<ObjectValue> {
    return new RuleNewObjectExpression(() => {
        fc.ruleExpression.execute(new Evaluation(), true);
        return fc;
    });
}
