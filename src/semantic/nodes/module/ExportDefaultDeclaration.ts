import {Declaration, ExportDefaultDeclaration, ExportNamedDeclaration} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ExportDefaultDeclaration(node: ExportDefaultDeclaration): RuleExpression<CompletionRecord> {
    const declaration = trackOptimized(toRule(node.declaration));

    return inNewScope(
        declaration ? [new RuleLetStatement('declaration', declaration)] : [],
        () => types.builders.exportDefaultDeclaration(declaration.toExpression())); // TODO
}
