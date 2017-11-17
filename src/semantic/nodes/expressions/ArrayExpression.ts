import {ArrayExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../../domain/CompletionRecords';
import {JSValue} from '../../domain/js/JSValue';
import {newObject, ObjectValue} from '../../domain/js/ObjectValue';
import {readVariable} from '../../rules/Basic';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {calculableExpression} from '../../rules/expression/RuleParamExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleBlockStatement, RuleLetStatement, RuleReturn, RuleStatement} from '../../rules/RuleStatements';
import {ArrayDescriptor} from '../NodeHelper';

export function ArrayExpression(node: ArrayExpression): RuleExpression<CompletionRecord> {
    const elements = node.elements.map(element => trackOptimized(toRule(element)));
    return inNewScope([
        new RuleLetStatement('array', newObject(new ArrayDescriptor([]))),
        ...elements.map(addElement),
        new RuleReturn(normalCompletion(readVariable('array')))
    ], () => types.builders.arrayExpression(elements.map(element => element.toExpression()))); // TODO
}

function addElement(element: RuleExpression<CompletionRecord>): RuleStatement { // todo check spec
    return new RuleBlockStatement([
        new RuleLetStatement('value', getValue(element)),
        returnIfAbrupt('value'),
        new RuleLetStatement('array', calculableExpression(
            push,
            readVariable('array'),
            readVariable('value')
        ))
    ]);
}

function push(array: ObjectValue, element: JSValue): JSValue {
    return new ObjectValue(new ArrayDescriptor([...(array.descriptor as ArrayDescriptor).elements, element]));
}
