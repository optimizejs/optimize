import {Node} from 'estree';
import {CompletionRecord} from './semantic/domain/CompletionRecords';
import {BinaryExpression, createBinaryExpression} from './semantic/nodes/BinaryExpression';
import {createExpressionStatement, ExpressionStatement} from './semantic/nodes/ExpressionStatement';
import {IfStatement} from './semantic/nodes/IfStatement';
import {createLiteral, Literal} from './semantic/nodes/Literal';
import {createProgram, Program} from './semantic/nodes/Program';
import {ThrowStatement} from './semantic/nodes/ThrowStatement';
import {RuleExpression} from './semantic/rules/RuleExpression';

type RuleMapping = (node: Node) => RuleExpression<CompletionRecord>;

type BackMapper = (rule: RuleExpression<CompletionRecord>) => Node | null;

const ruleMap: { [type: string]: RuleMapping } = {
    BinaryExpression,
    ExpressionStatement,
    IfStatement,
    Literal,
    Program,
    ThrowStatement
};

const backMap: BackMapper[] = [
    createBinaryExpression,
    createExpressionStatement,
    createLiteral,
    createProgram
];

export function toRule(node: Node): RuleExpression<CompletionRecord> {
    return ruleMap[node.type](node);
}

export function toNode(rule: RuleExpression<CompletionRecord>): Node {
    for (const mapper of backMap) {
        const result = mapper(rule);
        if (result !== null) {
            return result;
        }
    }
    throw new Error('No mapping found!');
}
