import {ArrowFunctionExpression, BlockStatement, FunctionExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord, normalCompletion} from '../../domain/CompletionRecords';
import {newFunction} from '../../domain/js/ObjectValue';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement, RuleReturn} from '../../rules/RuleStatements';
import {FunctionDescriptor} from '../NodeHelper';

export function FunctionExpression(node: FunctionExpression): RuleExpression<CompletionRecord> {
    const params = node.params.map(param => trackOptimized(toRule(param)));
    const body = trackOptimized(toRule(node.body));

    const ruleExpression = inNewScope([
        ...params.map(p => new RuleLetStatement('p', p)),
        new RuleLetStatement('b', getValue(body))
    ]);

    const backMapper = () => types.builders.functionExpression(
        node.id ? node.id : null,
        params.map(param => param.toExpression()),
        body.toStatement() as BlockStatement,
        node.generator as boolean
    );

    return inNewScope([
        new RuleReturn(normalCompletion(newFunction(new FunctionDescriptor(ruleExpression, backMapper))))
    ], backMapper); // TODO
}

export function ArrowFunctionExpression(node: ArrowFunctionExpression): RuleExpression<CompletionRecord> {
    const params = node.params.map(param => trackOptimized(toRule(param)));
    const body = trackOptimized(toRule(node.body));

    const ruleExpression = inNewScope([
        ...params.map(p => new RuleLetStatement('p', p)),
        new RuleLetStatement('b', getValue(body))
    ]);

    const backMapper = () => {
        const expression = node.expression;
        const paramExpressions = params.map(param => param.toExpression());
        if (expression) {
            return types.builders.arrowFunctionExpression(paramExpressions, body.toExpression(), true);
        } else {
            return types.builders.arrowFunctionExpression(paramExpressions, body.toNode(), false);
        }
    };
    return inNewScope([
        new RuleReturn(normalCompletion(newFunction(new FunctionDescriptor(ruleExpression, backMapper))))
    ], backMapper); // TODO
}
