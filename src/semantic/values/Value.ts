import {unknown} from '../rules/Helper';
import {RuleExpression} from '../rules/RuleExpression';
import {ReferenceValue} from './ReferenceValue';

export class Value {
    value: true;
}

export const EMPTY: RuleExpression<Value> = null as any; // todo

export function isReference(value: RuleExpression<Value>): RuleExpression<boolean> {
    return unknown();
}

export function toObject(value: RuleExpression<Value>): RuleExpression<ReferenceValue> {
    return unknown();
}

export function isEmptyValue(v: RuleExpression<Value>): RuleExpression<boolean> {
    throw new Error('not implemented yet');
}
