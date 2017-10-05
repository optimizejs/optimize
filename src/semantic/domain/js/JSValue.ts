import {
    notImplementedUnaryCalculator,
    RuleExpression,
    RuleUnaryExpression,
    SimpleUnaryCalculator
} from '../../rules/RuleExpression';
import {ObjectValue} from './ObjectValue';

export abstract class JSValue {
    jsValue: true;

    abstract getType(): Type;
}

export const enum Type {
    UNDEFINED,
    NULL,
    BOOLEAN,
    STRING,
    SYMBOL,
    NUMBER,
    OBJECT
}

export function toObject(value: RuleExpression<JSValue>): RuleExpression<ObjectValue> {
    return new RuleUnaryExpression(value, notImplementedUnaryCalculator);
}

export function getType(expression: RuleExpression<JSValue>): RuleExpression<Type> {
    return new RuleUnaryExpression(expression, new SimpleUnaryCalculator(value => value.getType()));
}
