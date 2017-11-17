import {UnaryExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../../domain/CompletionRecords';
import {JSValue} from '../../domain/js/JSValue';
import {ObjectValue} from '../../domain/js/ObjectValue';
import {PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {readVariable} from '../../rules/Basic';
import {toBoolean, toNumber} from '../../rules/BuiltIn';
import {RuleExpression, trackOptimized, TrackOptimizedExpression} from '../../rules/expression/RuleExpression';
import {constant} from '../../rules/expression/RuleNoVarExpresion';
import {RuleParamExpression} from '../../rules/expression/RuleParamExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement, RuleReturn} from '../../rules/RuleStatements';

export function UnaryExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    switch (node.operator) {
        case 'void':
            return VoidExpression(node);
        case 'typeof':
            return TypeofExpression(node);
        case '+':
            return PlusExpression(node);
        case '-':
            return MinusExpression(node);
        case '!':
            return NegateExpression(node);
        case '~':
            return BitwiseNotExpression(node);
    }

    const argument = trackOptimized(toRule(node.argument));
    return inNewScope([
        new RuleLetStatement('ret', getValue(argument))
    ], () => types.builders.unaryExpression(node.operator, argument.toExpression())); // TODO
}

function VoidExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));

    return inNewScope([
        new RuleLetStatement('status', getValue(argument)),
        returnIfAbrupt('status'),
        new RuleReturn(normalCompletion(constant(new PrimitiveValue(void 0))))
    ], backMapper(node, argument));
}

function getTypeof(value: JSValue): string {
    if (value instanceof PrimitiveValue) {
        return typeof value.value;
    }
    return (value as ObjectValue).descriptor.hasCall ? 'function' : 'object';
}

const typeofCalculator = (value: JSValue) => {
    return new PrimitiveValue(getTypeof(value));
};

function TypeofExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));

    return inNewScope([
        new RuleLetStatement('val', getValue(argument)),
        returnIfAbrupt('val'),
        new RuleReturn(normalCompletion(new RuleParamExpression(typeofCalculator, readVariable('val'))))
    ], backMapper(node, argument));
}

function PlusExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));

    return inNewScope([
        new RuleLetStatement('val', getValue(argument)),
        returnIfAbrupt('val'),
        new RuleReturn(toNumber(readVariable('val')))
    ], backMapper(node, argument));
}

const minusCalculator = primitiveCalculator(val => -(val as number));

function MinusExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));

    return inNewScope([
        new RuleLetStatement('val', getValue(argument)),
        returnIfAbrupt('val'),
        new RuleLetStatement('num', toNumber(readVariable('val'))),
        returnIfAbrupt('num'),
        new RuleReturn(normalCompletion(new RuleParamExpression(
            minusCalculator,
            readVariable('num')
        )))
    ], backMapper(node, argument));
}

const negateCalculator = primitiveCalculator(val => !(val as boolean));

function NegateExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));

    return inNewScope([
        new RuleLetStatement('val', getValue(argument)),
        returnIfAbrupt('val'),
        new RuleLetStatement('bool', toBoolean(readVariable('val'))),
        returnIfAbrupt('bool'),
        new RuleReturn(normalCompletion(new RuleParamExpression(
            negateCalculator,
            readVariable('bool')
        )))
    ], backMapper(node, argument));
}

/* tslint:disable-next-line */ // bitwise
const bitwiseNotCalculator = primitiveCalculator(val => ~(val as number));

function BitwiseNotExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    const argument = trackOptimized(toRule(node.argument));

    return inNewScope([
        new RuleLetStatement('val', getValue(argument)),
        returnIfAbrupt('val'),
        new RuleLetStatement('num', toNumber(readVariable('val'))),
        returnIfAbrupt('num'),
        new RuleReturn(normalCompletion(new RuleParamExpression(
            bitwiseNotCalculator,
            readVariable('num')
        )))
    ], backMapper(node, argument));
}

function backMapper(node: UnaryExpression, argument: TrackOptimizedExpression): () => UnaryExpression {
    return () => types.builders.unaryExpression(node.operator, argument.toExpression());
}

function primitiveCalculator(mapper: (p: primitive) => primitive): (val: PrimitiveValue) => PrimitiveValue {
    return (value: JSValue) => {
        return new PrimitiveValue(mapper((value as PrimitiveValue).value));
    };
}
