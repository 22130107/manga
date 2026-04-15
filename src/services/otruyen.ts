import type { Manga } from '../types/manga'

export const HOME_API_URL = 'https://otruyenapi.com/v1/api/home'
export const NEW_RELEASE_API_URL = 'https://otruyenapi.com/v1/api/danh-sach/truyen-moi'
export const SEARCH_API_URL = 'https://otruyenapi.com/v1/api/tim-kiem'
const NEW_RELEASE_ITEMS_PER_PAGE = 30
const SEARCH_ITEMS_PER_PAGE = 30
const OTRUYEN_API_PAGE_SIZE = 24
const SEARCH_CACHE_TTL_MS = 60_000
const SEARCH_CACHE_MAX_ENTRIES = 120
const SUGGESTION_LIMIT = 8
const SUGGESTION_CACHE_TTL_MS = 60_000
const SUGGESTION_CACHE_MAX_ENTRIES = 200
const NEW_RELEASE_CACHE_TTL_MS = 90_000
const HOT_SPOTLIGHT_CACHE_TTL_MS = 10 * 60_000
const COMIC_DETAIL_CACHE_TTL_MS = 15 * 60_000

type SearchPageResult = {
  items: Manga[]
  totalPages: number
  totalItems: number
  pageRanges: number
}

type NewReleasePageResult = {
  items: Manga[]
  totalPages: number
  pageRanges: number
}

const searchResultCache = new Map<string, { expiresAt: number; value: SearchPageResult }>()
const searchRequestsInFlight = new Map<string, Promise<SearchPageResult>>()
const searchSuggestionCache = new Map<string, { expiresAt: number; value: Manga[] }>()
const searchSuggestionRequestsInFlight = new Map<string, Promise<Manga[]>>()
const newReleasePageCache = new Map<string, { expiresAt: number; value: NewReleasePageResult }>()
const comicDetailCache = new Map<string, { expiresAt: number; value: ComicDetail }>()
let hotSpotlightCache: { expiresAt: number; value: Manga[] } | null = null

const CURATED_HOT_SLUGS = [
  'sousou-no-frieren',
  'quai-vat-8',
  'kagurabachi',
  'sat-thu-ve-vuon',
  'blue-box',
  'wind-breaker',
  'oshi-no-ko',
  'bat-hanh-va-bat-tu',
  'nhung-doa-hoa-thom-no-diem-kieu',
  'gia-toc-diep-vien-yozakura',
]

export type OTruyenHomeResponse = {
  status: string
  message: string
  data: {
    seoOnPage?: {
      titleHead?: string
      descriptionHead?: string
    }
    items: Array<{
      _id: string
      name: string
      slug: string
      status?: string
      thumb_url?: string
      updatedAt?: string
      chaptersLatest?: Array<{
        chapter_name?: string
        filename?: string
      }>
    }>
    APP_DOMAIN_CDN_IMAGE?: string
    APP_DOMAIN_FRONTEND?: string
    params?: {
      pagination?: {
        totalItems?: number
        totalItemsPerPage?: number
        currentPage?: number
        pageRanges?: number
      }
    }
  }
}

export type OTruyenDetailResponse = {
  status: string
  message: string
  data: {
    APP_DOMAIN_CDN_IMAGE?: string
    item: {
      _id: string
      name: string
      slug: string
      content?: string
      status?: string
      thumb_url?: string
      origin_name?: string[]
      author?: string[]
      category?: Array<{
        id: string
        name: string
        slug: string
      }>
      chapters?: Array<{
        server_name: string
        server_data: Array<{
          filename: string
          chapter_name?: string
          chapter_title?: string
          chapter_api_data: string
        }>
      }>
    }
  }
}

export type OTruyenSearchResponse = {
  status: string
  message: string
  data: {
    APP_DOMAIN_CDN_IMAGE?: string
    items: Array<{
      _id: string
      name: string
      slug: string
      status?: string
      thumb_url?: string
      updatedAt?: string
      category?: Array<{
        id: string
        name: string
        slug: string
      }>
      chaptersLatest?: Array<{
        chapter_name?: string
        filename?: string
      }>
    }>
    params?: {
      pagination?: {
        totalItems?: number
        totalItemsPerPage?: number
        currentPage?: number
        pageRanges?: number
      }
    }
  }
}

export type OTruyenChapterResponse = {
  status: string
  message: string
  data: {
    domain_cdn?: string
    item: {
      _id: string
      comic_name: string
      chapter_name: string
      chapter_title?: string
      chapter_path: string
      chapter_image: Array<{
        image_page: number
        image_file: string
      }>
    }
  }
}

export type MangaChapter = {
  chapterId: string
  chapterName: string
  chapterTitle?: string
  filename: string
}

export type ComicDetail = {
  id: string
  name: string
  slug: string
  content?: string
  status?: string
  imageUrl: string
  originNames: string[]
  authors: string[]
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  chapters: MangaChapter[]
}

export type ChapterReader = {
  comicName: string
  chapterName: string
  chapterTitle?: string
  images: string[]
}

function mapDetailToManga(detail: ComicDetail): Manga {
  const latestChapter = detail.chapters[0]

  return {
    id: detail.id,
    title: detail.name,
    chapter: latestChapter ? `Chapter ${latestChapter.chapterName}` : 'Đang cập nhật',
    imageUrl: detail.imageUrl,
    imageAlt: detail.name,
    href: buildInternalComicLink(detail.slug),
    badge: mapStatusBadge(detail.status),
    isHot: true,
    isScaled: false,
    categories: detail.categories.map((category) => category.name),
    categorySlugs: detail.categories.map((category) => category.slug),
  }
}

function buildImageUrl(baseUrl: string | undefined, thumbUrl: string | undefined) {
  if (!thumbUrl) {
    return 'https://via.placeholder.com/300x450?text=No+Image'
  }

  if (!baseUrl) {
    return thumbUrl
  }

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  return `${normalizedBaseUrl}/uploads/comics/${thumbUrl}`
}

function mapStatusBadge(status?: string) {
  if (status === 'completed') {
    return 'END'
  }

  if (status === 'coming_soon') {
    return 'Oneshot'
  }

  return undefined
}

function buildInternalComicLink(slug: string) {
  return `/truyen/${slug}`
}

function extractChapterId(chapterApiData: string) {
  try {
    return new URL(chapterApiData).pathname.split('/').pop() ?? chapterApiData
  } catch {
    return chapterApiData.split('/').pop() ?? chapterApiData
  }
}

function mapCatalogItems(
  baseUrl: string | undefined,
  items: Array<{
    _id: string
    name: string
    slug: string
    status?: string
    thumb_url?: string
    chaptersLatest?: Array<{
      chapter_name?: string
      filename?: string
    }>
    category?: Array<{
      id: string
      name: string
      slug: string
    }>
  }>,
) {
  return items.map((item, index) => {
    const latestChapter = item.chaptersLatest?.[0]

    return {
      id: item._id,
      title: item.name,
      chapter: latestChapter?.chapter_name ? `Chapter ${latestChapter.chapter_name}` : latestChapter?.filename ?? 'Đang cập nhật',
      imageUrl: buildImageUrl(baseUrl, item.thumb_url),
      imageAlt: item.name,
      href: buildInternalComicLink(item.slug),
      badge: mapStatusBadge(item.status),
      isHot: index < 10,
      isScaled: index === 0,
      categories: item.category?.map((category) => category.name) ?? [],
      categorySlugs: item.category?.map((category) => category.slug) ?? [],
    } satisfies Manga
  })
}

function normalizeCategoryValues(categories: string[]) {
  return categories.map((category) => category.trim().toLowerCase()).filter(Boolean)
}

function normalizeCategoryQueryValue(category: string) {
  return category
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSearchCategories(categories: string[]) {
  const uniqueValues = new Set(normalizeCategoryValues(categories))
  return Array.from(uniqueValues).sort((left, right) => left.localeCompare(right))
}

function getFreshCacheValue<T>(cache: Map<string, { expiresAt: number; value: T }>, key: string) {
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key)
    return null
  }

  return entry.value
}

function setBoundedCacheValue<T>(
  cache: Map<string, { expiresAt: number; value: T }>,
  key: string,
  value: T,
  ttlMs: number,
  maxEntries: number,
) {
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  })

  if (cache.size <= maxEntries) {
    return
  }

  const oldestKey = cache.keys().next().value

  if (oldestKey) {
    cache.delete(oldestKey)
  }
}

function createSearchCacheKey(keyword: string, page: number, categories: string[]) {
  return JSON.stringify({
    keyword: keyword.trim().toLowerCase(),
    page,
    categories,
  })
}

function createSearchSuggestionCacheKey(keyword: string, categories: string[]) {
  return JSON.stringify({
    keyword: keyword.trim().toLowerCase(),
    categories,
  })
}

function createNewReleaseCacheKey(page: number, categories: string[]) {
  return JSON.stringify({ page, categories })
}

function setSearchCacheEntry(key: string, value: SearchPageResult) {
  setBoundedCacheValue(searchResultCache, key, value, SEARCH_CACHE_TTL_MS, SEARCH_CACHE_MAX_ENTRIES)
}

function matchesRequestedCategories(
  itemCategories: Array<{
    id: string
    name: string
    slug: string
  }> | undefined,
  requestedCategories: Set<string>,
) {
  if (requestedCategories.size === 0) {
    return true
  }

  return itemCategories?.some((category) => {
    const normalizedName = category.name.trim().toLowerCase()
    const normalizedSlug = category.slug.trim().toLowerCase()

    return requestedCategories.has(normalizedName) || requestedCategories.has(normalizedSlug)
  }) ?? false
}

async function fetchAllNewReleasePayloads() {
  const firstResponse = await fetch(`${NEW_RELEASE_API_URL}?page=1`)

  if (!firstResponse.ok) {
    throw new Error(`Request failed with status ${firstResponse.status}`)
  }

  const firstPayload = (await firstResponse.json()) as OTruyenHomeResponse
  const totalItems = firstPayload.data.params?.pagination?.totalItems ?? firstPayload.data.items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / OTRUYEN_API_PAGE_SIZE))

  if (totalPages === 1) {
    return [firstPayload]
  }

  const remainingPayloads = await Promise.all(
    Array.from({ length: totalPages - 1 }, async (_, index) => {
      const response = await fetch(`${NEW_RELEASE_API_URL}?page=${index + 2}`)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      return (await response.json()) as OTruyenHomeResponse
    }),
  )

  return [firstPayload, ...remainingPayloads]
}

async function fetchBestMatch(keyword: string) {
  const searchParams = new URLSearchParams()
  searchParams.set('keyword', keyword)
  searchParams.set('page', '1')

  const response = await fetch(`${SEARCH_API_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as OTruyenSearchResponse
  const mappedItems = mapCatalogItems(payload.data.APP_DOMAIN_CDN_IMAGE, payload.data.items)

  return mappedItems[0] ?? null
}

export async function fetchHomeSpotlight() {
  const response = await fetch(HOME_API_URL)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as OTruyenHomeResponse
  const items = mapCatalogItems(payload.data.APP_DOMAIN_CDN_IMAGE, payload.data.items.slice(0, NEW_RELEASE_ITEMS_PER_PAGE))

  return {
    hotItems: items.slice(0, 10),
    newTotalPages: Math.max(1, Math.ceil((payload.data.params?.pagination?.totalItems ?? items.length) / NEW_RELEASE_ITEMS_PER_PAGE)),
    pageRanges: payload.data.params?.pagination?.pageRanges ?? 5,
  }
}

export async function fetchCuratedHotSpotlight() {
  if (hotSpotlightCache && hotSpotlightCache.expiresAt > Date.now()) {
    return hotSpotlightCache.value
  }

  const results = await Promise.allSettled(
    CURATED_HOT_SLUGS.map(async (slug) => {
      const detail = await fetchComicDetail(slug)
      return mapDetailToManga(detail)
    }),
  )

  const uniqueItems: Manga[] = []
  const seenIds = new Set<string | number>()

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) {
      continue
    }

    if (seenIds.has(result.value.id)) {
      continue
    }

    seenIds.add(result.value.id)
    uniqueItems.push(result.value)

    if (uniqueItems.length >= 10) {
      break
    }
  }

  hotSpotlightCache = {
    expiresAt: Date.now() + HOT_SPOTLIGHT_CACHE_TTL_MS,
    value: uniqueItems,
  }

  return uniqueItems
}

export async function fetchNewReleasePage(page: number, categories: string[] = []) {
  const normalizedCategories = normalizeSearchCategories(categories)
  const cacheKey = createNewReleaseCacheKey(page, normalizedCategories)
  const cachedResult = getFreshCacheValue(newReleasePageCache, cacheKey)

  if (cachedResult) {
    return cachedResult
  }

  const requestedCategories = new Set(normalizedCategories)

  if (normalizedCategories.length === 1) {
    const categoryQuery = normalizeCategoryQueryValue(normalizedCategories[0])

    if (categoryQuery) {
      const startIndex = (page - 1) * NEW_RELEASE_ITEMS_PER_PAGE
      const apiStartPage = Math.floor(startIndex / OTRUYEN_API_PAGE_SIZE) + 1
      const apiEndPage = Math.floor((startIndex + NEW_RELEASE_ITEMS_PER_PAGE - 1) / OTRUYEN_API_PAGE_SIZE) + 1
      const apiPageNumbers = Array.from({ length: apiEndPage - apiStartPage + 1 }, (_, index) => apiStartPage + index)

      const responses = await Promise.all(
        apiPageNumbers.map(async (pageNumber) => {
          const searchParams = new URLSearchParams()
          searchParams.set('page', String(pageNumber))
          searchParams.set('category', categoryQuery)

          const response = await fetch(`${SEARCH_API_URL}?${searchParams.toString()}`)

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`)
          }

          return (await response.json()) as OTruyenSearchResponse
        }),
      )

      const firstPayload = responses[0]
      const combinedItems = responses.flatMap((response) => response.data.items)
      const startWithinCombined = startIndex - (apiStartPage - 1) * OTRUYEN_API_PAGE_SIZE
      const pageItems = combinedItems.slice(startWithinCombined, startWithinCombined + NEW_RELEASE_ITEMS_PER_PAGE)
      const mappedItems = mapCatalogItems(firstPayload.data.APP_DOMAIN_CDN_IMAGE, pageItems)
      const result = {
        items: mappedItems,
        totalPages: Math.max(1, Math.ceil((firstPayload.data.params?.pagination?.totalItems ?? mappedItems.length) / NEW_RELEASE_ITEMS_PER_PAGE)),
        pageRanges: firstPayload.data.params?.pagination?.pageRanges ?? 5,
      } satisfies NewReleasePageResult

      setBoundedCacheValue(newReleasePageCache, cacheKey, result, NEW_RELEASE_CACHE_TTL_MS, SEARCH_CACHE_MAX_ENTRIES)
      return result
    }
  }

  if (requestedCategories.size > 0) {
    const payloads = await fetchAllNewReleasePayloads()
    const firstPayload = payloads[0]
    const allItems = payloads.flatMap((response) => response.data.items)
    const filteredItems = allItems.filter((item) => matchesRequestedCategories(item.category, requestedCategories))
    const startIndex = (page - 1) * NEW_RELEASE_ITEMS_PER_PAGE
    const pageItems = filteredItems.slice(startIndex, startIndex + NEW_RELEASE_ITEMS_PER_PAGE)
    const mappedItems = mapCatalogItems(firstPayload.data.APP_DOMAIN_CDN_IMAGE, pageItems)

    const result = {
      items: mappedItems,
      totalPages: Math.max(1, Math.ceil(filteredItems.length / NEW_RELEASE_ITEMS_PER_PAGE)),
      pageRanges: firstPayload.data.params?.pagination?.pageRanges ?? 5,
    } satisfies NewReleasePageResult

    setBoundedCacheValue(newReleasePageCache, cacheKey, result, NEW_RELEASE_CACHE_TTL_MS, SEARCH_CACHE_MAX_ENTRIES)
    return result
  }

  const startIndex = (page - 1) * NEW_RELEASE_ITEMS_PER_PAGE
  const apiStartPage = Math.floor(startIndex / OTRUYEN_API_PAGE_SIZE) + 1
  const apiEndPage = Math.floor((startIndex + NEW_RELEASE_ITEMS_PER_PAGE - 1) / OTRUYEN_API_PAGE_SIZE) + 1
  const apiPageNumbers = Array.from({ length: apiEndPage - apiStartPage + 1 }, (_, index) => apiStartPage + index)

  const responses = await Promise.all(
    apiPageNumbers.map(async (pageNumber) => {
      const response = await fetch(`${NEW_RELEASE_API_URL}?page=${pageNumber}`)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      return (await response.json()) as OTruyenHomeResponse
    }),
  )

  const firstPayload = responses[0]
  const combinedItems = responses.flatMap((response) => response.data.items)
  const startWithinCombined = startIndex - (apiStartPage - 1) * OTRUYEN_API_PAGE_SIZE
  const pageItems = combinedItems.slice(startWithinCombined, startWithinCombined + NEW_RELEASE_ITEMS_PER_PAGE)
  const mappedItems = mapCatalogItems(firstPayload.data.APP_DOMAIN_CDN_IMAGE, pageItems)

  const result = {
    items: mappedItems,
    totalPages: Math.max(1, Math.ceil((firstPayload.data.params?.pagination?.totalItems ?? mappedItems.length) / NEW_RELEASE_ITEMS_PER_PAGE)),
    pageRanges: firstPayload.data.params?.pagination?.pageRanges ?? 5,
  } satisfies NewReleasePageResult

  setBoundedCacheValue(newReleasePageCache, cacheKey, result, NEW_RELEASE_CACHE_TTL_MS, SEARCH_CACHE_MAX_ENTRIES)
  return result
}

export async function fetchSearchPage(keyword: string, page = 1, categories: string[] = []) {
  const normalizedKeyword = keyword.trim()
  const normalizedCategories = normalizeSearchCategories(categories)
  const cacheKey = createSearchCacheKey(normalizedKeyword, page, normalizedCategories)
  const cachedEntry = getFreshCacheValue(searchResultCache, cacheKey)

  if (cachedEntry) {
    return cachedEntry
  }

  const existingRequest = searchRequestsInFlight.get(cacheKey)

  if (existingRequest) {
    return existingRequest
  }

  const requestPromise = (async () => {
    const baseSearchParams = new URLSearchParams()

    if (normalizedKeyword) {
      baseSearchParams.set('keyword', normalizedKeyword)
    }

    if (normalizedCategories.length === 1) {
      baseSearchParams.set('category', normalizeCategoryQueryValue(normalizedCategories[0]))
    } else {
      for (const category of normalizedCategories) {
        baseSearchParams.append('filterCategory[]', category)
      }
    }

    const startIndex = (page - 1) * SEARCH_ITEMS_PER_PAGE
    const apiStartPage = Math.floor(startIndex / OTRUYEN_API_PAGE_SIZE) + 1
    const apiEndPage = Math.floor((startIndex + SEARCH_ITEMS_PER_PAGE - 1) / OTRUYEN_API_PAGE_SIZE) + 1
    const apiPageNumbers = Array.from({ length: apiEndPage - apiStartPage + 1 }, (_, index) => apiStartPage + index)

    const responses = await Promise.all(
      apiPageNumbers.map(async (pageNumber) => {
        const pageSearchParams = new URLSearchParams(baseSearchParams)
        pageSearchParams.set('page', String(pageNumber))

        const response = await fetch(`${SEARCH_API_URL}?${pageSearchParams.toString()}`)

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        return (await response.json()) as OTruyenSearchResponse
      }),
    )

    const firstPayload = responses[0]
    const combinedItems = responses.flatMap((response) => response.data.items)
    const startWithinCombined = startIndex - (apiStartPage - 1) * OTRUYEN_API_PAGE_SIZE
    const pageItems = combinedItems.slice(startWithinCombined, startWithinCombined + SEARCH_ITEMS_PER_PAGE)
    const mappedItems = mapCatalogItems(firstPayload.data.APP_DOMAIN_CDN_IMAGE, pageItems)
    const result = {
      items: mappedItems,
      totalPages: Math.max(1, Math.ceil((firstPayload.data.params?.pagination?.totalItems ?? mappedItems.length) / SEARCH_ITEMS_PER_PAGE)),
      totalItems: firstPayload.data.params?.pagination?.totalItems ?? mappedItems.length,
      pageRanges: firstPayload.data.params?.pagination?.pageRanges ?? 5,
    } satisfies SearchPageResult

    setSearchCacheEntry(cacheKey, result)
    return result
  })()

  searchRequestsInFlight.set(cacheKey, requestPromise)

  try {
    return await requestPromise
  } finally {
    searchRequestsInFlight.delete(cacheKey)
  }
}

export async function fetchSearchSuggestions(keyword: string, categories: string[] = []) {
  const normalizedKeyword = keyword.trim()

  if (normalizedKeyword.length < 2) {
    return []
  }

  const normalizedCategories = normalizeSearchCategories(categories)
  const cacheKey = createSearchSuggestionCacheKey(normalizedKeyword, normalizedCategories)
  const cachedValue = getFreshCacheValue(searchSuggestionCache, cacheKey)

  if (cachedValue) {
    return cachedValue
  }

  const existingRequest = searchSuggestionRequestsInFlight.get(cacheKey)

  if (existingRequest) {
    return existingRequest
  }

  const requestPromise = (async () => {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')
    searchParams.set('keyword', normalizedKeyword)

    if (normalizedCategories.length === 1) {
      searchParams.set('category', normalizeCategoryQueryValue(normalizedCategories[0]))
    }

    const response = await fetch(`${SEARCH_API_URL}?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const payload = (await response.json()) as OTruyenSearchResponse
    let mappedItems = mapCatalogItems(payload.data.APP_DOMAIN_CDN_IMAGE, payload.data.items)

    if (normalizedCategories.length > 1) {
      const requestedCategorySlugs = new Set(normalizedCategories.map((category) => normalizeCategoryQueryValue(category)))
      mappedItems = mappedItems.filter((item) => item.categorySlugs?.some((slug) => requestedCategorySlugs.has(slug.toLowerCase())) ?? false)
    }

    const result = mappedItems.slice(0, SUGGESTION_LIMIT)
    setBoundedCacheValue(searchSuggestionCache, cacheKey, result, SUGGESTION_CACHE_TTL_MS, SUGGESTION_CACHE_MAX_ENTRIES)
    return result
  })()

  searchSuggestionRequestsInFlight.set(cacheKey, requestPromise)

  try {
    return await requestPromise
  } finally {
    searchSuggestionRequestsInFlight.delete(cacheKey)
  }
}

export async function fetchComicDetail(slug: string): Promise<ComicDetail> {
  const cacheKey = slug.trim().toLowerCase()
  const cachedDetail = getFreshCacheValue(comicDetailCache, cacheKey)

  if (cachedDetail) {
    return cachedDetail
  }

  const response = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as OTruyenDetailResponse
  const item = payload.data.item
  const chapters = item.chapters
    ?.flatMap((server) => server.server_data)
    .map((chapter) => ({
      chapterId: extractChapterId(chapter.chapter_api_data),
      chapterName: chapter.chapter_name ?? chapter.filename,
      chapterTitle: chapter.chapter_title,
      filename: chapter.filename,
    }))
    .sort((left, right) => {
      const leftNumber = Number(left.chapterName)
      const rightNumber = Number(right.chapterName)

      if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
        return rightNumber - leftNumber
      }

      return right.chapterName.localeCompare(left.chapterName)
    }) ?? []

  const result = {
    id: item._id,
    name: item.name,
    slug: item.slug,
    content: item.content,
    status: item.status,
    imageUrl: buildImageUrl(payload.data.APP_DOMAIN_CDN_IMAGE, item.thumb_url),
    originNames: item.origin_name ?? [],
    authors: item.author ?? [],
    categories: item.category ?? [],
    chapters,
  }

  setBoundedCacheValue(comicDetailCache, cacheKey, result, COMIC_DETAIL_CACHE_TTL_MS, SEARCH_CACHE_MAX_ENTRIES)
  return result
}

export async function fetchChapterReader(chapterId: string): Promise<ChapterReader> {
  const response = await fetch(`https://sv1.otruyencdn.com/v1/api/chapter/${chapterId}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as OTruyenChapterResponse
  const item = payload.data.item
  const domainCdn = payload.data.domain_cdn?.replace(/\/$/, '') ?? 'https://sv1.otruyencdn.com'

  return {
    comicName: item.comic_name,
    chapterName: item.chapter_name,
    chapterTitle: item.chapter_title,
    images: item.chapter_image.map((image) => `${domainCdn}/${item.chapter_path}/${image.image_file}`),
  }
}
