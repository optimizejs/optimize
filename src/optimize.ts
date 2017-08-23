import recast = require('recast');
import {RuleMapper} from './RuleMapper';

function optimizeSource(src: string): string {
    const node = recast.parse(src);

    const ruleMapper = new RuleMapper();

    const rule = ruleMapper.toRule(node.program);
    const newNode = ruleMapper.toNode(rule);

    return recast.print(newNode).code;
}

export = optimizeSource;
