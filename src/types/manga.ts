export interface Manga {
  id: string | number
  title: string
  chapter?: string
  imageUrl: string
  imageAlt: string
  href: string
  badge?: string
  isHot?: boolean
  isScaled?: boolean
  categories?: string[]
  categorySlugs?: string[]
}