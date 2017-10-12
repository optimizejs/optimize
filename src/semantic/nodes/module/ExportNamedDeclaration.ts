import {Declaration, ExportNamedDeclaration} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ExportNamedDeclaration(node: ExportNamedDeclaration): RuleExpression<CompletionRecord> {
    const declaration = node.declaration ? trackOptimized(toRule(node.declaration)) : null;

    return inNewScope(
        declaration ? [new RuleLetStatement('declaration', declaration)] : [],
        () => types.builders.exportNamedDeclaration(
            declaration ? declaration.toStatement() as Declaration : null,
            node.specifiers,
            node.source
        )); // TODO
}
