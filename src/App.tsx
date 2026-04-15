import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ChapterReaderPage } from './pages/ChapterReaderPage'
import { ComicDetailPage } from './pages/ComicDetailPage'
import { HomePage } from './pages/HomePage'
import { IntroPage } from './pages/IntroPage'
import { SearchPage } from './pages/SearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gioi-thieu" element={<IntroPage />} />
        <Route path="/tim-kiem" element={<SearchPage />} />
        <Route path="/truyen/:slug" element={<ComicDetailPage />} />
        <Route path="/truyen/:slug/chuong/:chapterId" element={<ChapterReaderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
