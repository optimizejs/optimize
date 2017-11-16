import {Expression} from 'estree';
import {types} from 'recast';
import {JSValue} from '../domain/js/JSValue';
import {ObjectDescriptor, ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';
import {RuleExpression} from '../rules/expression/RuleExpression';

export class RegExpDescriptor implements ObjectDescriptor {
    readonly hasCall = true;

    constructor(readonly pattern: string, readonly flags: string) {
    }
}

export class ArrayDescriptor implements ObjectDescriptor {
    readonly hasCall = false;

    constructor(readonly elements: JSValue[]) {
    }
}

export class FunctionDescriptor implements ObjectDescriptor {
    readonly hasCall = true;

    constructor(readonly ruleExpression: RuleExpression<any>, readonly backMapper: () => Expression) {
    }
}

export interface ObjectProperty {
    key: string;
    kind: 'init' | 'get' | 'set';
    value: JSValue;
}

export class StandardObjectDescriptor implements ObjectDescriptor {
    readonly hasCall = false;

    constructor(readonly properties: ObjectProperty[]) {
    }
}

function isNegativeZero(value: primitive): boolean {
    return value === 0 && 1 / value !== 1 / 0;
}

export function createLiteralFromValue(value: JSValue): Expression {
    let literalValue;
    if (value instanceof PrimitiveValue) {
        literalValue = value.value;
        if (literalValue === void 0) {
            return types.builders.unaryExpression('void', types.builders.literal(0));
        } else if (isNegativeZero(literalValue)) {
            return types.builders.unaryExpression('-', types.builders.literal(0));
        }
    } else {
        const payload = (value as ObjectValue).descriptor;
        if (payload instanceof RegExpDescriptor) {
            literalValue = new RegExp(payload.pattern, payload.flags);
        } else if (payload instanceof ArrayDescriptor) {
            return types.builders.arrayExpression(payload.elements.map(createLiteralFromValue));
        } else if (payload instanceof StandardObjectDescriptor) {
            return types.builders.objectExpression(payload.properties.map((op: ObjectProperty) => {
                const propValue = createLiteralFromValue(op.value);
                return types.builders.property(op.kind, types.builders.identifier(op.key), propValue);
            }));
        } else if (payload instanceof FunctionDescriptor) {
            return payload.backMapper();
        }
    }
    return types.builders.literal(literalValue);
}
