import {BreakStatement, Identifier} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function BreakStatement(node: BreakStatement): RuleExpression<CompletionRecord> {
    return inNewScope([], () => types.builders.breakStatement(node.label as Identifier | null)); // TODO
}
