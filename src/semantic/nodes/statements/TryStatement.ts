import {BlockStatement, CatchClause, Pattern, TryStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function TryStatement(node: TryStatement): RuleExpression<CompletionRecord> {
    const block = trackOptimized(toRule(node.block));
    const handler = node.handler ? trackOptimized(toRule(node.handler)) : null;
    const finalizer = node.finalizer ? trackOptimized(toRule(node.finalizer)) : null;
    return inNewScope([
        new RuleLetStatement('block', getValue(block)),
        ... handler ? [new RuleLetStatement('handler', getValue(handler))] : [],
        ... finalizer ? [new RuleLetStatement('finalizer', getValue(finalizer))] : []
    ], () => types.builders.tryStatement(
        block.toStatement() as BlockStatement,
        handler && handler.toNode<CatchClause>(),
        finalizer && finalizer.toStatement() as BlockStatement
    )); // TODO
}

export function CatchClause(node: CatchClause): RuleExpression<CompletionRecord> {
    const param = trackOptimized(toRule(node.param));
    const body = trackOptimized(toRule(node.body));
    return inNewScope([
        new RuleLetStatement('param', getValue(param)),
        new RuleLetStatement('block', getValue(body)),
    ], () => types.builders.catchClause(
        param.toExpression() as Pattern,
        null,
        body.toStatement() as BlockStatement
    )); // TODO
}
