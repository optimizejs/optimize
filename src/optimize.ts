import recast = require('recast');
import {toNode, toRule} from './RuleMapper';

function optimizeSource(src: string): string {
    const node = recast.parse(src);

    const rule = toRule(node.program);
    const newNode = toNode(rule);

    return recast.print(newNode).code;
}

export = optimizeSource;
