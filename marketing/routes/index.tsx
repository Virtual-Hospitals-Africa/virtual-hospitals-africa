import bodyHtml from '../vha-index-body.html?raw'

export default function MarketingIndexPage() {
  return (
    <>
      <link rel='stylesheet' href='/vha-inline.css' />
      <link rel='stylesheet' href='/_components/v2/c5e6db3422cae17afac74a0bfab366b56bfd1072.css' />
      {/* deno-lint-ignore react-no-danger */}
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  )
}
