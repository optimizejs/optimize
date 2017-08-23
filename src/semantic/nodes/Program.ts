import {Program} from 'estree';
import {RuleFunction} from '../rules/RuleStatements';

export function Program(node: Program): RuleFunction {
    return new RuleFunction([], [
        // TODO
    ]);
}
