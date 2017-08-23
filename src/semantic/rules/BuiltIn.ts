import {PrimitiveValue} from '../values/PrimitiveValue';
import {ReferenceValue} from '../values/ReferenceValue';
import {unknown} from './Helper';
import {RuleExpression} from './RuleExpression';

export function regExpCreate(pattern: RuleExpression<PrimitiveValue>,
                             flags: RuleExpression<PrimitiveValue>): RuleExpression<ReferenceValue> {

    throw new Error('not implemented yet');
}

export function referenceError(): RuleExpression<ReferenceValue> {
    return unknown();
}
