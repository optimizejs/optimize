import {RuleExpression} from '../../rules/expression/RuleExpression';
import {
    notImplementedCalculator,
    RuleParamExpression,
} from '../../rules/expression/RuleParamExpression';
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
    return new RuleParamExpression(notImplementedCalculator, value);
}

export function getType(expression: RuleExpression<JSValue>): RuleExpression<Type> {
    return new RuleParamExpression<Type, JSValue>(value => value.getType(), expression);
}
