// stolen from https://github.com/davidmarkclements/rfdc

type AnyObject = {
  [key: string]: any;
}

export default function clone(source?: AnyObject): any {
  if (typeof source !== 'object' || source === null) {
    return source;
  }

  if (Array.isArray(source)) {
    const length = source.length;
    const result = new Array(length);

    for (let i = 0; i < length; i++) {
      const value = source[i];

      if (typeof value !== 'object' || value === null) {
        result[i] = value;
      } else {
        result[i] = clone(value);
      }
    }

    return result;
  }

  const keys = Object.keys(source);
  const result: AnyObject = {};

  for (const key of keys) {
    const value: any = source[key];

    if (typeof value !== 'object' || value === null) {
      result[key] = value;
    } else {
      result[key] = clone(value);
    }
  }

  return result;
}
