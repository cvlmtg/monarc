declare module 'jsan' {
  export type Reviver = (key: string, value: any) => any;

  export function stringify(object: object): string;
  export function parse(json: string, reviver?: Reviver): object;
}
