import {RuleExpression, RuleUnaryExpression} from '../../rules/RuleExpression';
import {JSValue} from './JSValue';

export class PrimitiveValue extends JSValue {
    constructor(readonly value: primitive) {
        super();
    }
}

export function isPrimitive(value: RuleExpression<JSValue>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, arg => arg instanceof PrimitiveValue);
}

export function is(value: RuleExpression<PrimitiveValue>, target: primitive): RuleExpression<boolean> {
    throw new Error('Not implemented!');
}
