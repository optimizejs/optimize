import {Node} from 'estree';
import {ExpressionStatement} from './semantic/nodes/ExpressionStatement';
import {IfStatement} from './semantic/nodes/IfStatement';
import {Literal} from './semantic/nodes/Literal';
import {Program} from './semantic/nodes/Program';
import {ThrowStatement} from './semantic/nodes/ThrowStatement';
import {RuleFunction} from './semantic/rules/RuleStatements';

type RuleMapping = (node: Node) => RuleFunction;

const ruleMap: { [type: string]: RuleMapping } = {
    ExpressionStatement,
    IfStatement,
    Literal,
    Program,
    ThrowStatement
};

export class RuleMapper {
    private map: Map<RuleFunction, Node> = new Map<RuleFunction, Node>();

    toRule(node: Node): RuleFunction {
        const rule = ruleMap[node.type](node);
        this.map.set(rule, node);
        return rule;
    }

    toNode(rule: RuleFunction): Node {
        return this.map.get(rule) as Node;
    }
}
