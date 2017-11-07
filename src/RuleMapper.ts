import {Expression, Node, Program as IProgram, Statement} from 'estree';
import {CompletionRecord} from './semantic/domain/CompletionRecords';
import {ArrayExpression} from './semantic/nodes/expressions/ArrayExpression';
import {AssignmentExpression} from './semantic/nodes/expressions/AssignmentExpression';
import {BinaryExpression} from './semantic/nodes/expressions/BinaryExpression';
import {CallExpression} from './semantic/nodes/expressions/CallExpression';
import {ConditionalExpression} from './semantic/nodes/expressions/ConditionalExpression';
import {ArrowFunctionExpression, FunctionExpression} from './semantic/nodes/expressions/FunctionExpression';
import {Identifier} from './semantic/nodes/expressions/Identifier';
import {createLiteral, Literal} from './semantic/nodes/expressions/Literal';
import {LogicalExpression} from './semantic/nodes/expressions/LogicalExpression';
import {MemberExpression} from './semantic/nodes/expressions/MemberExpression';
import {MetaProperty} from './semantic/nodes/expressions/MetaProperty';
import {NewExpression} from './semantic/nodes/expressions/NewExpression';
import {ObjectExpression, Property} from './semantic/nodes/expressions/ObjectExpression';
import {SequenceExpression} from './semantic/nodes/expressions/SequenceExpression';
import {Super} from './semantic/nodes/expressions/Super';
import {TaggedTemplateExpression, TemplateLiteral} from './semantic/nodes/expressions/TemplateLiteral';
import {ThisExpression} from './semantic/nodes/expressions/ThisExpression';
import {UnaryExpression} from './semantic/nodes/expressions/UnaryExpression';
import {UpdateExpression} from './semantic/nodes/expressions/UpdateExpression';
import {YieldExpression} from './semantic/nodes/expressions/YieldExpression';
import {ExportAllDeclaration} from './semantic/nodes/module/ExportAllDeclaration';
import {ExportDefaultDeclaration} from './semantic/nodes/module/ExportDefaultDeclaration';
import {ExportNamedDeclaration} from './semantic/nodes/module/ExportNamedDeclaration';
import {ImportDeclaration} from './semantic/nodes/module/ImportDeclaration';
import {ArrayPattern} from './semantic/nodes/patterns/ArrayPattern';
import {AssignmentPattern} from './semantic/nodes/patterns/AssignmentPattern';
import {ObjectPattern} from './semantic/nodes/patterns/ObjectPattern';
import {RestElement} from './semantic/nodes/patterns/RestElement';
import {SpreadElement} from './semantic/nodes/patterns/SpreadElement';
import {createProgram, Program} from './semantic/nodes/Program';
import {BlockStatement} from './semantic/nodes/statements/BlockStatement';
import {BreakStatement} from './semantic/nodes/statements/BreakStatement';
import {ClassBody, ClassDeclaration, MethodDefinition} from './semantic/nodes/statements/ClassDeclaration';
import {ContinueStatement} from './semantic/nodes/statements/ContinueStatement';
import {DebuggerStatement} from './semantic/nodes/statements/DebuggerStatement';
import {DoWhileStatement} from './semantic/nodes/statements/DoWhileStatement';
import {EmptyStatement} from './semantic/nodes/statements/EmptyStatement';
import {createExpressionStatement, ExpressionStatement} from './semantic/nodes/statements/ExpressionStatement';
import {ForInStatement} from './semantic/nodes/statements/ForInStatement';
import {ForOfStatement} from './semantic/nodes/statements/ForOfStatement';
import {ForStatement} from './semantic/nodes/statements/ForStatement';
import {FunctionDeclaration} from './semantic/nodes/statements/FunctionDeclaration';
import {IfStatement} from './semantic/nodes/statements/IfStatement';
import {LabeledStatement} from './semantic/nodes/statements/LabeledStatement';
import {ReturnStatement} from './semantic/nodes/statements/ReturnStatement';
import {SwitchCase, SwitchStatement} from './semantic/nodes/statements/SwitchStatement';
import {createThrowStatement, ThrowStatement} from './semantic/nodes/statements/ThrowStatement';
import {CatchClause, TryStatement} from './semantic/nodes/statements/TryStatement';
import {VariableDeclaration, VariableDeclarator} from './semantic/nodes/statements/VariableDeclaration';
import {WhileStatement} from './semantic/nodes/statements/WhileStatement';
import {WithStatement} from './semantic/nodes/statements/WithStatement';
import {BackMapper, RuleExpression} from './semantic/rules/expression/RuleExpression';

type RuleMapping = (node: Node) => RuleExpression<CompletionRecord>;

type MaybeBackMapper<T extends Node> = (rule: RuleExpression<CompletionRecord>) => T | null;

const ruleMap: { [type: string]: RuleMapping } = {
    ArrayExpression,
    ArrayPattern,
    ArrowFunctionExpression,
    AssignmentExpression,
    AssignmentPattern,
    BinaryExpression,
    BlockStatement,
    BreakStatement,
    CallExpression,
    CatchClause,
    ClassBody,
    ClassDeclaration,
    ConditionalExpression,
    ContinueStatement,
    DebuggerStatement,
    DoWhileStatement,
    EmptyStatement,
    ExportAllDeclaration,
    ExportDefaultDeclaration,
    ExportNamedDeclaration,
    ExpressionStatement,
    ForInStatement,
    ForOfStatement,
    ForStatement,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    IfStatement,
    ImportDeclaration,
    LabeledStatement,
    Literal,
    LogicalExpression,
    MemberExpression,
    MetaProperty,
    MethodDefinition,
    NewExpression,
    ObjectExpression,
    ObjectPattern,
    Program,
    Property,
    RestElement,
    ReturnStatement,
    SequenceExpression,
    SpreadElement,
    Super,
    SwitchCase,
    SwitchStatement,
    TaggedTemplateExpression,
    TemplateLiteral,
    ThisExpression,
    ThrowStatement,
    TryStatement,
    UnaryExpression,
    UpdateExpression,
    VariableDeclaration,
    VariableDeclarator,
    WhileStatement,
    WithStatement,
    YieldExpression
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
