import {UnaryExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../../domain/CompletionRecords';
import {PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {constant} from '../../rules/expression/RuleNoVarExpresion';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement, RuleReturn} from '../../rules/RuleStatements';

export function UnaryExpression(node: UnaryExpression): RuleExpression<CompletionRecord> {
    switch (node.operator) {
        case 'void':
            return VoidExpression(node);
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
    ], () => types.builders.unaryExpression(node.operator, argument.toExpression()));
}
