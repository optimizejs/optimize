import {Literal, RegExpLiteral} from 'estree';
import {isLiteralable} from '../../utils/Utils';
import {normalCompletion} from '../CompletionRecords';
import {regExpCreate} from '../rules/BuiltIn';
import {RuleFunction, RuleReturn} from '../rules/RuleStatements';
import {constant} from '../values/PrimitiveValue';

export function Literal(node: Literal): RuleFunction { // TODO template literal
    if (isLiteralable(node.value)) {
        return new RuleFunction([], [
            new RuleReturn(normalCompletion(constant(node.value)))
        ]);
    } else {
        const regex = (node as RegExpLiteral).regex;
        return new RuleFunction([], [
            new RuleReturn(normalCompletion(regExpCreate(constant(regex.pattern), constant(regex.flags))))
        ]);
    }
}
