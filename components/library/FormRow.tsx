import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'

export default function FormRow(
  { className, children }: { className?: string; children: ComponentChildren },
) {
  return (
    //flex：讓這個 <div> 變成 flex 容器，裡面的子元素會橫向排列（預設 row）。
    //w-full：寬度 100%，佔滿父容器。
    //justify-between：子元素左右兩端對齊，中間自動拉開距離。
    //gap-3：子元素之間有固定間距（gap），這裡是 0.75rem。
    <div className={cls('flex w-full justify-between gap-3', className)}>
      {children}
    </div>
  )
}
