import {Node} from 'estree';
import {createExpressionStatement, ExpressionStatement} from './semantic/nodes/ExpressionStatement';
import {IfStatement} from './semantic/nodes/IfStatement';
import {createLiteral, Literal} from './semantic/nodes/Literal';
import {createProgram, Program} from './semantic/nodes/Program';
import {ThrowStatement} from './semantic/nodes/ThrowStatement';
import {RuleFunction} from './semantic/rules/RuleStatements';

type RuleMapping = (node: Node) => RuleFunction;

type BackMapper = (rule: RuleFunction) => Node | null;

const ruleMap: { [type: string]: RuleMapping } = {
    ExpressionStatement,
    IfStatement,
    Literal,
    Program,
    ThrowStatement
};

const backMap: BackMapper[] = [
    createExpressionStatement,
    createLiteral,
    createProgram
];

export function toRule(node: Node): RuleFunction {
    return ruleMap[node.type](node);
}

export function toNode(rule: RuleFunction): Node {
    for (const mapper of backMap) {
        const result = mapper(rule);
        if (result !== null) {
            return result;
        }
    }
    throw new Error('No mapping found!');
}
