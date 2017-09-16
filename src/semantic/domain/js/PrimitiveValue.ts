import {unknown} from '../../rules/Helper';
import {RuleExpression} from '../../rules/RuleExpression';
import {JSValue} from './JSValue';

export class PrimitiveValue extends JSValue {
    constructor(readonly value: primitive) {
        super();
    }
}

export function isPrimitive(value: RuleExpression<JSValue>): RuleExpression<boolean> {
    return unknown();
}

export function is(value: RuleExpression<PrimitiveValue>, target: primitive): RuleExpression<boolean> {
    return unknown();
}
