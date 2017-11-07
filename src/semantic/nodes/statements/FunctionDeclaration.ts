import {BlockStatement, FunctionDeclaration} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function FunctionDeclaration(node: FunctionDeclaration): RuleExpression<CompletionRecord> {
    const params = node.params.map(param => trackOptimized(toRule(param)));
    const body = trackOptimized(toRule(node.body));
    return inNewScope([
        ...params.map(p => new RuleLetStatement('p', p)),
        new RuleLetStatement('b', getValue(body))
    ], () => types.builders.functionDeclaration(
        node.id,
        params.map(param => param.toExpression()),
        body.toStatement() as BlockStatement,
        node.generator as boolean
    )); // TODO
}
