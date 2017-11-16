import {Identifier, ObjectExpression, Property} from 'estree';
import {types} from 'recast';
import {toRule} from '../../../RuleMapper';
import {CompletionRecord, normalCompletion, returnIfAbrupt} from '../../domain/CompletionRecords';
import {JSValue} from '../../domain/js/JSValue';
import {newObject, ObjectValue} from '../../domain/js/ObjectValue';
import {PrimitiveValue} from '../../domain/js/PrimitiveValue';
import {readVariable} from '../../rules/Basic';
import {toString} from '../../rules/BuiltIn';
import {RuleExpression, trackOptimized, TrackOptimizedExpression} from '../../rules/expression/RuleExpression';
import {constant} from '../../rules/expression/RuleNoVarExpresion';
import {RuleParamExpression, SimpleCalculator} from '../../rules/expression/RuleParamExpression';
import {getValue} from '../../rules/Others';
import {inNewScope, RuleBlockStatement, RuleLetStatement, RuleReturn, RuleStatement} from '../../rules/RuleStatements';
import {ObjectProperty, StandardObjectDescriptor} from '../NodeHelper';

interface PropertyInfo {
    key: TrackOptimizedExpression;
    value: TrackOptimizedExpression;
    property: Property;
}

export function ObjectExpression(node: ObjectExpression): RuleExpression<CompletionRecord> {
    const properties: PropertyInfo[] = node.properties.map(property => {
        return {
            key: trackOptimized(toRule(property.key)),
            property,
            value: trackOptimized(toRule(property.value))
        };
    });
    return inNewScope([
        new RuleLetStatement('object', newObject(new StandardObjectDescriptor([]))),
        ...properties.map(addProperty),
        new RuleReturn(normalCompletion(readVariable('object')))
    ], () => types.builders.objectExpression(properties.map((property: PropertyInfo) => {
        const propertyNode = property.property;
        const result = types.builders.property(
            propertyNode.kind,
            property.key.toExpression(),
            property.value.toExpression()
        );
        result.method = propertyNode.method;
        result.shorthand = propertyNode.shorthand;
        result.computed = propertyNode.computed;
        return result;
    }))); // TODO
}

function addProperty(propInfo: PropertyInfo): RuleStatement { // todo check spec
    let calculateKey: RuleExpression<CompletionRecord>;
    if (propInfo.property.computed) {
        calculateKey = getValue(propInfo.key);
    } else {
        calculateKey = normalCompletion(constant(new PrimitiveValue((propInfo.property.key as Identifier).name)));
    }
    return new RuleBlockStatement([
        new RuleLetStatement('key', calculateKey),
        returnIfAbrupt('key'),
        new RuleLetStatement('keyStr', toString(readVariable('key'))),
        returnIfAbrupt('keyStr'),
        new RuleLetStatement('value', getValue(propInfo.value)),
        returnIfAbrupt('value'),
        new RuleLetStatement('object', new RuleParamExpression(
            new SimpleCalculator((object: ObjectValue, key: PrimitiveValue, value: JSValue): JSValue => {
                    const newProperty: ObjectProperty = {
                        key: key.value as string,
                        kind: propInfo.property.kind,
                        value
                    };
                    return new ObjectValue(new StandardObjectDescriptor([
                        ...(object.descriptor as StandardObjectDescriptor).properties,
                        newProperty
                    ]));
                }
            ),
            readVariable('object'),
            readVariable('keyStr'),
            readVariable('value')
        ))
    ]);
}
