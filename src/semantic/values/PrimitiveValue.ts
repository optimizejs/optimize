import {primitive} from '../../utils/Utils';
import {unknown} from '../rules/Helper';
import {RuleExpression} from '../rules/RuleExpression';
import {Value} from './Value';

export class PrimitiveValue extends Value {
    primitive: true;
}

export function constant<T>(value: primitive): RuleExpression<PrimitiveValue> {
    throw new Error('not implemented yet');
}

export function isPrimitive(value: RuleExpression<Value>): RuleExpression<boolean> {
    return unknown();
}
