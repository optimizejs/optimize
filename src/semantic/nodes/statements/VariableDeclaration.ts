import {VariableDeclaration, VariableDeclarator} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function VariableDeclaration(node: VariableDeclaration): RuleExpression<CompletionRecord> {
    const declarations = node.declarations.map(declaration => trackOptimized(toRule(declaration)));
    return inNewScope(
        declarations.map(declaration => new RuleLetStatement('d', declaration)),
        () => types.builders.variableDeclaration(node.kind, declarations.map(param => param.toNode()))
    ); // TODO
}

export function VariableDeclarator(node: VariableDeclarator): RuleExpression<CompletionRecord> {
    const id = trackOptimized(toRule(node.id));
    const init = node.init ? trackOptimized(toRule(node.init)) : null;
    return inNewScope([
            new RuleLetStatement('i', id),
            ...init ? [new RuleLetStatement('d', init)] : []
        ],
        () => types.builders.variableDeclarator(id.toNode(), init ? init.toExpression() : null)
    ); // TODO
}
