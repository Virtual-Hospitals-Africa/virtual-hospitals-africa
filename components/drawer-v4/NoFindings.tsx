import cls from '../../util/cls.ts'
import { recordChipPaddingClassName } from './recordChipClassName.ts'

export function NoFindings({ explanation, with_padding_x }: { explanation: string; with_padding_x: boolean }) {
  return <span className={cls(recordChipPaddingClassName({ with_padding_x }), 'text-gray-400')}>{explanation}</span>
}
