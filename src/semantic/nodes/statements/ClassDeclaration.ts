import {ClassBody, ClassDeclaration, FunctionExpression, MethodDefinition} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression, trackOptimized} from '../../rules/RuleExpression';
import {inNewScope, RuleLetStatement} from '../../rules/RuleStatements';

export function ClassDeclaration(node: ClassDeclaration): RuleExpression<CompletionRecord> {
    const superClass = node.superClass ? trackOptimized(toRule(node.superClass)) : null;
    const body = trackOptimized(toRule(node.body));

    return inNewScope([
            ...superClass ? [new RuleLetStatement('super', superClass)] : [],
            new RuleLetStatement('body', body)
        ],
        () => types.builders.classDeclaration(node.id, body.toNode(), superClass ? superClass.toExpression() : null)
    ); // TODO
}

export function ClassBody(node: ClassBody): RuleExpression<CompletionRecord> {
    const defs = node.body.map(def => trackOptimized(toRule(def)));
    return inNewScope(
        defs.map(def => new RuleLetStatement('def', def)),
        () => types.builders.classBody(defs.map(def => def.toNode()))
    );
}

export function MethodDefinition(node: MethodDefinition): RuleExpression<CompletionRecord> {
    const key = trackOptimized(toRule(node.key));
    const value = trackOptimized(toRule(node.value));

    return inNewScope([
            new RuleLetStatement('key', key),
            new RuleLetStatement('value', value)
        ], () => {
            const result = types.builders.methodDefinition(
                node.kind,
                key.toExpression(),
                value.toExpression() as FunctionExpression,
                node.static
            );
            result.computed = node.computed;
            return result;
        }
    );
}
