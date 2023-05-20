import getTag from "./internal/getTag.ts";
import isObjectLike from "./isObjectLike.ts";

const isDate = (value: unknown): value is Date =>
  isObjectLike(value) && getTag(value) == "[object Date]";

export default isDate;
