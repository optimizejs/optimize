import {BreakStatement, DebuggerStatement, Identifier} from 'estree';
import {types} from 'recast';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {RuleExpression} from '../../rules/expression/RuleExpression';
import {inNewScope} from '../../rules/RuleStatements';

export function DebuggerStatement(node: DebuggerStatement): RuleExpression<CompletionRecord> {
    return inNewScope([], () => types.builders.debuggerStatement()); // TODO
}
