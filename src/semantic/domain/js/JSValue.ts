import {RuleExpression} from '../../rules/expression/RuleExpression';
import {calculableExpression, notImplementedCalculator} from '../../rules/expression/RuleParamExpression';
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
    return calculableExpression(notImplementedCalculator, value);
}

export function getType(expression: RuleExpression<JSValue>): RuleExpression<Type> {
    return calculableExpression<Type, JSValue>(value => value.getType(), expression);
}
