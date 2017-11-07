import {Identifier, ThisExpression} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/expression/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function ThisExpression(node: ThisExpression): RuleExpression<CompletionRecord> {
    return inNewScope([], () => types.builders.thisExpression()); // TODO
}
