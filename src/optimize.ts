import recast = require('recast');
import {toProgram, toRule} from './RuleMapper';
import {Evaluation} from './semantic/rules/Evaluation';

function optimizeSource(src: string): string {
    const node = recast.parse(src);

    const rule = toRule(node.program);
    const optimized = rule.execute(new Evaluation(), true);
    const newNode = toProgram(optimized.get());

    const crlf = src[src.indexOf('\n') - 1] === '\r';
    return recast.print(newNode, {
        lineTerminator: crlf ? '\r\n' : '\n'
    }).code;
}

export = optimizeSource;
