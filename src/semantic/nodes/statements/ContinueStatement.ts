import {ContinueStatement, Identifier} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/expression/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function ContinueStatement(node: ContinueStatement): RuleExpression<CompletionRecord> {
    return inNewScope([], () => types.builders.continueStatement(node.label as Identifier | null)); // TODO
}
