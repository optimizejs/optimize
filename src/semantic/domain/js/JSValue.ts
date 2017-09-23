import {RuleExpression, RuleUnaryExpression} from '../../rules/RuleExpression';
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
    return new RuleUnaryExpression(value, () => {
        throw new Error('Not implemented!');
    });
}

export function isType(expression: RuleExpression<JSValue>, type: Type): RuleExpression<boolean> {
    return new RuleUnaryExpression(expression, value => value.getType() === type);
}
