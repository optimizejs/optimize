import {Node} from 'estree';
import {CompletionRecord} from '../CompletionRecords';
import {unknown} from './Helper';
import {RuleExpression} from './RuleExpression';
import {RuleFunction} from './RuleStatements';

export function evaluate(node: Node): RuleExpression<CompletionRecord> {
    throw new Error('not implemented yet');
}

export function call(fn: RuleFunction, parameters: RuleExpression<any>[]): RuleExpression<CompletionRecord> {
    throw new Error('not implemented yet');
}

export function readVariable(name: string): RuleExpression<any> {
    return unknown();
}

export function isSame<T>(a: RuleExpression<T>, b: RuleExpression<T>): RuleExpression<boolean> {
    throw new Error('not implemented yet');
}
