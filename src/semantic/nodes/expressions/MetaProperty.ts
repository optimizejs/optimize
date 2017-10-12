import {MetaProperty} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function MetaProperty(node: MetaProperty): RuleExpression<CompletionRecord> {
    return inNewScope([],
        () => types.builders.metaProperty(node.meta, node.property)); // TODO
}
