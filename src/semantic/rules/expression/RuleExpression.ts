import {Expression, Node, Statement} from 'estree';
import {toExpression, toNodeByMapper, toStatement} from '../../../RuleMapper';
import {CompletionRecord} from '../../domain/CompletionRecords';
import {Evaluation} from '../Evaluation';
import {Executable, VariableVisitor} from '../Executable';
import {Optimized} from '../Optimized';

export type BackMapper = () => Node;

export abstract class RuleExpression<T> implements Executable<RuleExpression<T>> {
    original: Node;

    constructor(readonly mapper?: BackMapper) {
    }

    abstract execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<T>>;

    abstract visitUsedVariables(visit: VariableVisitor): void;
}

export class TrackOptimizedExpression extends RuleExpression<CompletionRecord> {
    private wrapped: RuleExpression<CompletionRecord>;

    constructor(private argument: RuleExpression<CompletionRecord>) {
        super();
        this.wrapped = argument;
    }

    execute(evaluation: Evaluation, confident: boolean): Optimized<RuleExpression<CompletionRecord>> {
        const optimized = this.argument.execute(evaluation, confident);
        if (optimized.isOptimized()) {
            this.wrapped = optimized.get();
        }
        return optimized;
    }

    toNode<T extends Node>(): T {
        return toNodeByMapper(this.wrapped) as T;
    }

    toExpression(): Expression {
        return toExpression(this.wrapped);
    }

    toStatement(): Statement {
        return toStatement(this.wrapped);
    }

    visitUsedVariables(visit: VariableVisitor): void {
        this.wrapped.visitUsedVariables(visit);
    }
}

export function trackOptimized(argument: RuleExpression<CompletionRecord>): TrackOptimizedExpression {
    return new TrackOptimizedExpression(argument);
}
