import {Identifier} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function Identifier(node: Identifier): RuleExpression<CompletionRecord> {
    return inNewScope([], () => types.builders.identifier(node.name)); // TODO
}
