import { ComponentChildren, JSX } from 'preact'

import SectionHeader from './typography/SectionHeader.tsx'

// 表單區塊元件，包裹一個 section，帶有標題與內容
// 導出叫做form的函式元件,其他地方可以直接使用form
export default function Form(
  { className, header, children, ...props }: JSX.HTMLAttributes<HTMLElement> & {
    className?: string         // 區塊自訂 class
    header: string             // 區塊標題
    children: ComponentChildren// 區塊內容
  },
) {
  //return指的是這個元件渲染出來的內容
  return (
    <section {...props} className={className}>
      {/* 區塊標題 */}
      <SectionHeader className='mb-2'>{header}</SectionHeader>
      {/* 區塊內容 */}
      {children}
    </section>
  )
}
