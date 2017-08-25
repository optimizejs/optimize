import {unknown} from '../rules/Helper';
import {RuleExpression} from '../rules/RuleExpression';
import {Value} from './Value';

export class PrimitiveValue extends Value {
    primitive: true;
}

export class RuleConstantExpression implements RuleExpression<PrimitiveValue> {
    expression: PrimitiveValue;

    constructor(readonly value: primitive) {
    }
}

export function constant<T>(value: primitive): RuleExpression<PrimitiveValue> {
    return new RuleConstantExpression(value);
}

export function isPrimitive(value: RuleExpression<Value>): RuleExpression<boolean> {
    return unknown();
}
