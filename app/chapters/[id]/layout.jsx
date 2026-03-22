export async function generateMetadata({ params }) {
  const titles = {
    ch1: 'Chapter 1 — Introduction',
    ch2: 'Chapter 2 — Futures Markets & CCPs',
  }
  return {
    title: `${titles[params.id] || 'Chapter'} | DerivX`,
  }
}

export default function ChapterLayout({ children }) {
  return children
}
