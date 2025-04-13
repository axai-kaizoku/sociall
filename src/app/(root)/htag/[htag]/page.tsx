export default async function Page({
  params,
}: {
  params: Promise<{ htag: string }>
}) {
  const urlParams = await params
  return <div>{JSON.stringify(urlParams)}</div>
}
