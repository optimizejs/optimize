declare module 'recast' {
    import {Node} from 'estree';

    interface PrintResult {
        code: string;
    }

    export function parse(code: string): { program: Node };

    export function print(node: Node): PrintResult;
}
