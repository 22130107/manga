/**
 * API Service Example
 * 
 * Đổi tên file này thành api.ts và cập nhật API_BASE_URL
 * để bắt đầu sử dụng
 */

import { Manga, MangaApiResponse } from '../types/manga';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';

export class MangaAPI {
  /**
   * Lấy danh sách truyện HOT
   */
  static async getHotManga(): Promise<Manga[]> {
    const response = await fetch(`${API_BASE_URL}/manga/hot`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch hot manga');
    }
    
    const data: MangaApiResponse = await response.json();
    return data.data;
  }

  /**
   * Lấy danh sách truyện mới cập nhật
   */
  static async getNewManga(page: number = 1, pageSize: number = 10): Promise<Manga[]> {
    const response = await fetch(
      `${API_BASE_URL}/manga/new?page=${page}&pageSize=${pageSize}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch new manga');
    }
    
    const data: MangaApiResponse = await response.json();
    return data.data;
  }

  /**
   * Tìm kiếm truyện
   */
  static async searchManga(query: string): Promise<Manga[]> {
    const response = await fetch(
      `${API_BASE_URL}/manga/search?q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search manga');
    }
    
    const data: MangaApiResponse = await response.json();
    return data.data;
  }

  /**
   * Lấy truyện theo thể loại
   */
  static async getMangaByGenre(genre: string, page: number = 1): Promise<Manga[]> {
    const response = await fetch(
      `${API_BASE_URL}/manga/genre/${genre}?page=${page}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch manga by genre');
    }
    
    const data: MangaApiResponse = await response.json();
    return data.data;
  }

  /**
   * Lấy chi tiết một truyện
   */
  static async getMangaDetail(id: string): Promise<Manga> {
    const response = await fetch(`${API_BASE_URL}/manga/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch manga detail');
    }
    
    return await response.json();
  }

  /**
   * Lấy truyện ngẫu nhiên
   */
  static async getRandomManga(): Promise<Manga> {
    const response = await fetch(`${API_BASE_URL}/manga/random`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch random manga');
    }
    
    return await response.json();
  }
}
