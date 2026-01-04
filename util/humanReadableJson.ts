import {
  Formatter,
  FracturedJsonOptions,
  // EolStyle,
  // NumberListAlignment,
  // TableCommaPlacement,
  // CommentPolicy,
} from 'fracturedjsonjs'
import { MostlyJsonSerializable } from '../types.ts'

// The constructor below will give default behavior that is consistent across minor version
// changes.  But if you don't care about backward compatibility and just want the newest best
// settings whatever they are, use this instead:
//   const options = FracturedJsonOptions.Recommended();
const options = new FracturedJsonOptions()

// For examples of the options, see:
//   https://github.com/j-brooke/FracturedJson/wiki/Options
// Or experiment interactively with the web formatter:
//   https://j-brooke.github.io/FracturedJson/
// options.MaxTotalLineLength = 80;
// options.MaxInlineComplexity = 1;
// options.JsonEolStyle = EolStyle.Crlf;
// options.NumberListAlignment = NumberListAlignment.Left;
// options.TableCommaPlacement = TableCommaPlacement.BeforePadding;

const formatter = new Formatter()
formatter.Options = options

export function humanReadableJson(object: MostlyJsonSerializable): string {
  return formatter.Serialize(object)!
}
