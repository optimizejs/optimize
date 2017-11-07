import {Expression, ForStatement, VariableDeclaration} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ForStatement(node: ForStatement): RuleExpression<CompletionRecord> {
    const init = node.init ? trackOptimized(toRule(node.init)) : null;
    const test = node.test ? trackOptimized(toRule(node.test)) : null;
    const update = node.update ? trackOptimized(toRule(node.update)) : null;
    const body = trackOptimized(toRule(node.body));

    return inNewScope([
            ...init ? [new RuleLetStatement('init', init)] : [],
            ...test ? [new RuleLetStatement('test', test)] : [],
            ...update ? [new RuleLetStatement('update', update)] : [],
            new RuleLetStatement('body', body)
        ],
        () => types.builders.forStatement(
            init && init.toNode<Expression | VariableDeclaration>(),
            test && test.toExpression(),
            update && update.toExpression(),
            body.toStatement()
        )); // TODO
}
