import {EmptyStatement} from 'estree';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/expression/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function EmptyStatement(node: EmptyStatement): RuleExpression<CompletionRecord> {
    return inNewScope([], () => node); // TODO
}
