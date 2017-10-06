import {constant} from '../../rules/Basic';
import {Evaluation} from '../../rules/Evaluation';
import {Optimized} from '../../rules/Optimized';
import {RuleExpression} from '../../rules/RuleExpression';
import {CompletionRecord} from '../CompletionRecords';
import {JSValue, Type} from './JSValue';

export class ObjectValue extends JSValue {
    objectValue: true;

    constructor(readonly payload: any) {
        super();
    }

    getType(): Type {
        return Type.OBJECT;
    }
}

export class RuleNewObjectExpression<T> extends RuleExpression<ObjectValue> {
    constructor(readonly payload: T) {
        super();
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<ObjectValue>> {
        return Optimized.optimized(constant(new ObjectValue(this.payload)));
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
}

export function callGet(obj: RuleExpression<ObjectValue>, property: RuleExpression<string>,
                        thisValue: RuleExpression<ObjectValue>): RuleExpression<CompletionRecord> {

    return new RuleCallGetExpression(obj, property, thisValue);
}

export function newObject<T>(payload: T): RuleExpression<ObjectValue> {
    return new RuleNewObjectExpression(payload);
}
