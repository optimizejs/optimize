import {JSValue} from '../domain/js/JSValue';
import {ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {unknown} from './Helper';
import {RuleExpression} from './RuleExpression';

export function regExpCreate(pattern: RuleExpression<PrimitiveValue>,
                             flags: RuleExpression<PrimitiveValue>): RuleExpression<ObjectValue> {

    throw new Error('not implemented yet');
}

export function toNumber(param: RuleExpression<JSValue>): RuleExpression<PrimitiveValue> {
    return unknown();
}

export function referenceError(): RuleExpression<ObjectValue> {
    return unknown();
}
