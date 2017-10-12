import {ImportDeclaration} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function ImportDeclaration(node: ImportDeclaration): RuleExpression<CompletionRecord> {
    return inNewScope([
    ], () => types.builders.importDeclaration(
        node.specifiers,
        node.source
    )); // TODO
}
