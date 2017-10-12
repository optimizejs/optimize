import {Identifier, Super, ThisExpression} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function Super(node: Super): RuleExpression<CompletionRecord> {
    return inNewScope([], () => types.builders.super()); // TODO
}
