import {Evaluation} from './Evaluation';
import {Optimized} from './Optimized';

export type VariableVisitor = (name: string) => void;

export interface Executable<T extends Executable<T>> {
    execute(evaluation: Evaluation, confident: boolean): Optimized<T>;

    visitUsedVariables(visit: VariableVisitor): void;
}
