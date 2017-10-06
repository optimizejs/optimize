import {RuleExpression, RuleUnaryExpression, SimpleUnaryCalculator, UnaryCalculator} from '../../rules/RuleExpression';
import {JSValue, Type} from './JSValue';

export class PrimitiveValue extends JSValue {
    constructor(readonly value: primitive) {
        super();
    }

    getType(): Type {
        switch (typeof this.value) {
            case 'undefined':
                return Type.UNDEFINED;
            case 'object':
                return Type.NULL;
            case 'boolean':
                return Type.BOOLEAN;
            case 'string':
                return Type.STRING;
            case 'symbol':
                return Type.SYMBOL;
            case 'number':
                return Type.NUMBER;
        }
        throw new Error('Unknown type');
    }
}

export type Prim = PrimitiveValue;
export type PrimExpr = RuleExpression<Prim>;

export function isPrimitive(value: RuleExpression<JSValue>): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, new SimpleUnaryCalculator(arg => arg instanceof PrimitiveValue));
}

export function is(value: RuleExpression<PrimitiveValue>, target: primitive): RuleExpression<boolean> {
    return new RuleUnaryExpression(value, new SimpleUnaryCalculator(arg => arg.value === target));
}
