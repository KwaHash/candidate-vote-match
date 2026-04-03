import PoliticianDetailPage from '@/features/politician-detail'

export default function page({ params }: { params: { id: string } }) {
  const { id } = params
  return <PoliticianDetailPage id={id} />
}