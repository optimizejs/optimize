import {Expression} from 'estree';
import {types} from 'recast';
import {JSValue} from '../domain/js/JSValue';
import {ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';

export class RegExpCreation {
    constructor(readonly pattern: string, readonly flags: string) {
    }
}

export class ArrayCreation {
    constructor(readonly elements: JSValue[]) {
    }
}

export interface ObjectProperty {
    key: string;
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
            return types.builders.objectExpression(payload.properties.map(op => {
                const propValue = createLiteralFromValue(op.value);
                return types.builders.property('init', types.builders.identifier(op.key), propValue);
            }));
        }
    }
    return types.builders.literal(literalValue);
}
