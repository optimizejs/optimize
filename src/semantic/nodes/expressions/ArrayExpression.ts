import {ArrayExpression} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../../domain/CompletionRecords';
import {JSValue} from '../../domain/js/JSValue';
import {newObject, ObjectValue} from '../../domain/js/ObjectValue';
import {readVariable} from '../../rules/Basic';
import {RuleExpression, trackOptimized} from '../../rules/expression/RuleExpression';
import {RuleParamExpression, SimpleCalculator} from '../../rules/expression/RuleParamExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleBlockStatement, RuleLetStatement, RuleReturn, RuleStatement} from '../../rules/RuleStatements';
import {ArrayCreation} from '../NodeHelper';

export function ArrayExpression(node: ArrayExpression): RuleExpression<CompletionRecord> {
    const elements = node.elements.map(element => trackOptimized(toRule(element)));
    return inNewScope([
        new RuleLetStatement('array', newObject(new ArrayCreation([]))),
        ...elements.map(addElement),
        new RuleReturn(normalCompletion(readVariable('array')))
    ], () => types.builders.arrayExpression(elements.map(element => element.toExpression()))); // TODO
}

function addElement(element: RuleExpression<CompletionRecord>): RuleStatement { // todo check spec
    return new RuleBlockStatement([
        new RuleLetStatement('value', getValue(element)),
        returnIfAbrupt('value'),
        new RuleLetStatement('array', new RuleParamExpression(
            new SimpleCalculator(push),
            readVariable('array'),
            readVariable('value')
        ))
    ]);
}

function push(array: ObjectValue, element: JSValue): JSValue {
    return new ObjectValue(new ArrayCreation([...(array.payload as ArrayCreation).elements, element]));
}
