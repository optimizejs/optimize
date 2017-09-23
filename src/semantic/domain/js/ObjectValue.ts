import {Evaluation} from '../../rules/Evaluation';
import {Optimized} from '../../rules/Optimized';
import {RuleExpression} from '../../rules/RuleExpression';
import {CompletionRecord} from '../CompletionRecords';
import {JSValue, Type} from './JSValue';

export class ObjectValue extends JSValue {
    objectValue: true;

    getType(): Type {
        return Type.OBJECT;
    }
}

class RuleNewObjectExpression implements RuleExpression<ObjectValue> {
    expression: ObjectValue;

    execute(evaluation: Evaluation): Optimized<RuleExpression<ObjectValue>> {
        return Optimized.original(this);
    }
}

class RuleCallGetExpression implements RuleExpression<CompletionRecord> {
    expression: CompletionRecord;

    constructor(private obj: RuleExpression<ObjectValue>, private property: RuleExpression<string>,
                private thisValue: RuleExpression<ObjectValue>) {
    }

    execute(evaluation: Evaluation): Optimized<RuleExpression<CompletionRecord>> {
        const obj = this.obj.execute(evaluation);
        const property = this.property.execute(evaluation);
        const thisValue = this.thisValue.execute(evaluation);

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

export function newObject(): RuleExpression<ObjectValue> {
    return new RuleNewObjectExpression();
}
