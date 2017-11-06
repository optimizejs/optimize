import {Literal, UnaryExpression} from 'estree';
import {types} from 'recast';
import {JSValue} from '../domain/js/JSValue';
import {ObjectValue} from '../domain/js/ObjectValue';
import {PrimitiveValue} from '../domain/js/PrimitiveValue';

export class RegExpCreation {
    constructor(readonly pattern: string, readonly flags: string) {
    }
}

export function createLiteralFromValue(value: JSValue): Literal | UnaryExpression {
    let literalValue;
    if (value instanceof PrimitiveValue) {
        literalValue = value.value;
        if (literalValue === void 0) {
            return types.builders.unaryExpression('void', types.builders.literal(0));
        }
    } else {
        const regExpCreation = (value as ObjectValue).payload as RegExpCreation;
        literalValue = new RegExp(regExpCreation.pattern, regExpCreation.flags);
    }
    return types.builders.literal(literalValue);
}
