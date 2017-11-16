import {Expression} from 'estree';
import {types} from 'recast';
import {JSValue} from '../domain/js/JSValue';
import {ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {RuleExpression} from '../rules/expression/RuleExpression';

export class RegExpCreation {
    constructor(readonly pattern: string, readonly flags: string) {
    }
}

export class ArrayCreation {
    constructor(readonly elements: JSValue[]) {
    }
}

export class FunctionCreation {
    constructor(readonly ruleExpression: RuleExpression<any>, readonly backMapper: () => Expression) {
    }
}

export interface ObjectProperty {
    key: string;
    kind: 'init' | 'get' | 'set';
    value: JSValue;
}

export class ObjectCreation {
    constructor(readonly properties: ObjectProperty[]) {
    }
}

export function createLiteralFromValue(value: JSValue): Expression {
    let literalValue;
    if (value instanceof PrimitiveValue) {
        literalValue = value.value;
        if (literalValue === void 0) {
            return types.builders.unaryExpression('void', types.builders.literal(0));
        }
    } else {
        const payload = (value as ObjectValue).payload;
        if (payload instanceof RegExpCreation) {
            literalValue = new RegExp(payload.pattern, payload.flags);
        } else if (payload instanceof ArrayCreation) {
            return types.builders.arrayExpression(payload.elements.map(createLiteralFromValue));
        } else if (payload instanceof ObjectCreation) {
            return types.builders.objectExpression(payload.properties.map((op: ObjectProperty) => {
                const propValue = createLiteralFromValue(op.value);
                return types.builders.property(op.kind, types.builders.identifier(op.key), propValue);
            }));
        } else if (payload instanceof FunctionCreation) {
            return payload.backMapper();
        }
    }
    return types.builders.literal(literalValue);
}
