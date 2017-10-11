import {Expression, Node, Program as IProgram, Statement} from 'estree';
import {CompletionRecord} from './semantic/domain/CompletionRecords';
import {BinaryExpression} from './semantic/nodes/BinaryExpression';
import {ArrayExpression} from './semantic/nodes/expressions/ArrayExpression';
import {AssignmentExpression} from './semantic/nodes/expressions/AssignmentExpression';
import {CallExpression} from './semantic/nodes/expressions/CallExpression';
import {ConditionalExpression} from './semantic/nodes/expressions/ConditionalExpression';
import {FunctionExpression} from './semantic/nodes/expressions/FunctionExpression';
import {Identifier} from './semantic/nodes/expressions/Identifier';
import {MemberExpression} from './semantic/nodes/expressions/MemberExpression';
import {NewExpression} from './semantic/nodes/expressions/NewExpression';
import {ObjectExpression, Property} from './semantic/nodes/expressions/ObjectExpression';
import {SequenceExpression} from './semantic/nodes/expressions/SequenceExpression';
import {ThisExpression} from './semantic/nodes/expressions/ThisExpression';
import {UnaryExpression} from './semantic/nodes/expressions/UnaryExpression';
import {UpdateExpression} from './semantic/nodes/expressions/UpdateExpression';
import {createExpressionStatement, ExpressionStatement} from './semantic/nodes/ExpressionStatement';
import {IfStatement} from './semantic/nodes/IfStatement';
import {createLiteral, Literal} from './semantic/nodes/Literal';
import {LogicalExpression} from './semantic/nodes/LogicalExpression';
import {createProgram, Program} from './semantic/nodes/Program';
import {BlockStatement} from './semantic/nodes/statements/BlockStatement';
import {BreakStatement} from './semantic/nodes/statements/BreakStatement';
import {ContinueStatement} from './semantic/nodes/statements/ContinueStatement';
import {DebuggerStatement} from './semantic/nodes/statements/DebuggerStatement';
import {DoWhileStatement} from './semantic/nodes/statements/DoWhileStatement';
import {EmptyStatement} from './semantic/nodes/statements/EmptyStatement';
import {ForInStatement} from './semantic/nodes/statements/ForInStatement';
import {ForStatement} from './semantic/nodes/statements/ForStatement';
import {FunctionDeclaration} from './semantic/nodes/statements/FunctionDeclaration';
import {LabeledStatement} from './semantic/nodes/statements/LabeledStatement';
import {ReturnStatement} from './semantic/nodes/statements/ReturnStatement';
import {SwitchCase, SwitchStatement} from './semantic/nodes/statements/SwitchStatement';
import {CatchClause, TryStatement} from './semantic/nodes/statements/TryStatement';
import {VariableDeclaration, VariableDeclarator} from './semantic/nodes/statements/VariableDeclaration';
import {WhileStatement} from './semantic/nodes/statements/WhileStatement';
import {WithStatement} from './semantic/nodes/statements/WithStatement';
import {createThrowStatement, ThrowStatement} from './semantic/nodes/ThrowStatement';
import {BackMapper, RuleExpression} from './semantic/rules/RuleExpression';

type RuleMapping = (node: Node) => RuleExpression<CompletionRecord>;

type MaybeBackMapper<T extends Node> = (rule: RuleExpression<CompletionRecord>) => T | null;

const ruleMap: { [type: string]: RuleMapping } = {
    ArrayExpression,
    AssignmentExpression,
    BinaryExpression,
    BlockStatement,
    BreakStatement,
    CallExpression,
    CatchClause,
    ConditionalExpression,
    ContinueStatement,
    DebuggerStatement,
    DoWhileStatement,
    EmptyStatement,
    ExpressionStatement,
    ForInStatement,
    ForStatement,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    IfStatement,
    LabeledStatement,
    Literal,
    LogicalExpression,
    MemberExpression,
    NewExpression,
    ObjectExpression,
    Program,
    Property,
    ReturnStatement,
    SequenceExpression,
    SwitchCase,
    SwitchStatement,
    ThisExpression,
    ThrowStatement,
    TryStatement,
    UnaryExpression,
    UpdateExpression,
    VariableDeclaration,
    VariableDeclarator,
    WhileStatement,
    WithStatement
};

const expressionMap: MaybeBackMapper<Expression>[] = [
    createLiteral
];

const statementMap: MaybeBackMapper<Statement>[] = [
    createExpressionStatement,
    createThrowStatement
];

const programMap: MaybeBackMapper<IProgram>[] = [
    createProgram
];

export function toRule(node: Node): RuleExpression<CompletionRecord> {
    const result = ruleMap[node.type](node);
    result.original = node;
    return result;
}

export function toExpression(rule: RuleExpression<CompletionRecord>): Expression {
    return toNode(rule, expressionMap);
}

export function toStatement(rule: RuleExpression<CompletionRecord>): Statement {
    return toNode(rule, statementMap);
}

export function toProgram(rule: RuleExpression<CompletionRecord>): IProgram {
    return toNode(rule, programMap);
}

export function toNodeByMapper(rule: RuleExpression<CompletionRecord>): Node {
    return (rule.mapper as BackMapper)();
}

function toNode<T extends Node>(rule: RuleExpression<CompletionRecord>, map: MaybeBackMapper<T>[]): T {
    if (rule.mapper) {
        return rule.mapper() as T;
    }

    for (const mapper of map) {
        const result = mapper(rule);
        if (result !== null) {
            if (rule.original) {
                if (rule.original.type === result.type) {
                    const copy: T = clone(rule.original) as T;
                    const keys = Object.keys(result) as (keyof T)[];
                    for (const key of keys) {
                        copy[key] = result[key];
                    }
                    return copy;
                }
            }
            return result;
        }
    }
    throw new Error('No mapping found!');
}

function clone<T>(obj: T): T {
    const result = Object.create(Object.getPrototypeOf(obj));
    for (const key of Object.getOwnPropertyNames(obj)) {
        Object.defineProperty(result, key, Object.getOwnPropertyDescriptor(obj, key));
    }
    return result;
}
