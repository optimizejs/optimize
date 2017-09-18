import {CompletionRecord, NormalCompletionRecord} from '../domain/CompletionRecords';
import {JSValue} from '../domain/js/JSValue';
import {newObject, ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {RuleExpression, RuleUnaryExpression} from './RuleExpression';

export function regExpCreate(pattern: RuleExpression<PrimitiveValue>,
                             flags: RuleExpression<PrimitiveValue>): RuleExpression<ObjectValue> {

    throw new Error('not implemented yet');
}

export function toNumber(param: RuleExpression<JSValue>): RuleExpression<CompletionRecord> {
    return new RuleUnaryExpression(param, arg => {
        if (arg instanceof PrimitiveValue) {
            return new NormalCompletionRecord(new PrimitiveValue(+(arg.value as any)));
        } else {
            throw new Error('Converting object to primitive');
        }
    });
}

export function referenceError(): RuleExpression<ObjectValue> {
    return newObject();
}
