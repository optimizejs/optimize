import recast = require('recast');
import {toProgram, toRule} from './RuleMapper';
import {Evaluation} from './semantic/rules/Evaluation';

function optimizeSource(src: string): string {
    const node = recast.parse(src);

    const rule = toRule(node.program);
    const optimized = rule.execute(new Evaluation());
    const newNode = toProgram(optimized.get());

    return recast.print(newNode, {
        lineTerminator: '\n'
    }).code;
}

export = optimizeSource;
