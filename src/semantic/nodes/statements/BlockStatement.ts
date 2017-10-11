import {BlockStatement} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function BlockStatement(node: BlockStatement): RuleExpression<CompletionRecord> {
    const statements = node.body.map(statement => trackOptimized(toRule(statement)));
    return inNewScope([
        ...statements.map(statement => new RuleLetStatement('st', statement))
    ], () => types.builders.blockStatement(statements.map(statement => statement.toStatement()))); // TODO
}
