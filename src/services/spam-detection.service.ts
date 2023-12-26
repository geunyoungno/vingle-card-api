import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class SpamDetectionService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * 주어진 콘텐츠가 스팸인지 여부를 결정합니다.
   * @param {string} content - 사용자가 작성한 텍스트 콘텐츠.
   * @param {string[]} spamLinkDomains - 스팸으로 간주되는 도메인 목록.
   * @param {number} redirectionDepth - 리디렉션을 따를 최대 깊이.
   * @returns {Promise<boolean>} - 콘텐츠가 스팸인 경우 true, 아닌 경우 false를 반환합니다.
   */
  async isSpam(content: string, spamLinkDomains: string[], redirectionDepth: number): Promise<boolean> {
    const links = this.extractLinks(content);
    const uniqueLinks = this.removeDuplicateUrls(links);

    const checkPromises = uniqueLinks.map((link) => this.isLinkSpam(link, spamLinkDomains, redirectionDepth));
    const results = await Promise.all(checkPromises);
    return results.includes(true);
  }

  /**
   * 단일 링크가 스팸인지 여부를 확인합니다.
   * @param {string} link - 확인할 링크.
   * @param {string[]} spamLinkDomains - 스팸으로 간주되는 도메인 목록.
   * @param {number} depth - 리디렉션을 따를 깊이.
   * @returns {Promise<boolean>} - 링크가 스팸인 경우 true, 아닌 경우 false를 반환합니다.
   */
  private async isLinkSpam(link: string, spamLinkDomains: string[], depth: number): Promise<boolean> {
    const finalLinks = await this.followRedirections(link, depth);
    return finalLinks.some((finalLink) => this.isDomainSpam(finalLink, spamLinkDomains));
  }

  /**
   * 콘텐츠에서 모든 링크를 추출합니다.
   * @param {string} content - 링크를 추출할 텍스트 문자열.
   * @returns {string[]} - 추출된 URL 배열.
   */
  private extractLinks(content: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return content.match(urlRegex) || [];
  }

  /**
   * URL 배열에서 중복을 제거합니다.
   * @param {string[]} urls - 중복을 제거할 URL 배열.
   * @returns {string[]} - 중복이 제거된 URL 배열.
   */
  private removeDuplicateUrls(urls: string[]): string[] {
    return [...new Set(urls)];
  }

  /**
   * URL 리디렉션을 따릅니다.
   * @param {string} url - 따를 URL.
   * @param {number} depth - 리디렉션을 따를 최대 깊이.
   * @returns {Promise<string[]>} - 리디렉션을 따른 후의 URL 배열.
   */
  private async followRedirections(url: string, depth: number): Promise<string[]> {
    if (depth === 0) {
      return [url];
    }

    try {
      const response = await this.httpService.axiosRef.get(url, { maxRedirects: 0 });

      if (response.status === 200) {
        return this.handleHtmlRedirections(response.data, depth - 1);
      }

      if (response.status >= 301 && response.status <= 302) {
        return this.followRedirections(response.request.res.responseUrl || url, depth - 1);
      }

      return [response.request.res.responseUrl || url];
    } catch (error) {
      if (error.response && error.response.status >= 301 && error.response.status <= 302) {
        return this.followRedirections(error.response.request.res.responseUrl, depth);
      }
      return [url];
    }
  }

  /**
   * HTML 기반 리디렉션을 처리합니다.
   * @param {string} html - HTML 콘텐츠.
   * @param {number} depth - 리디렉션을 따를 최대 깊이.
   * @returns {Promise<string[]>} - 리디렉션을 따른 후의 URL 배열.
   */
  private async handleHtmlRedirections(html: string, depth: number): Promise<string[]> {
    const $ = cheerio.load(html);
    const redirectUrls = $('a')
      .get()
      .map((x) => $(x).attr('href'));

    const allRedirects = await Promise.all(
      redirectUrls.map((redirectUrl) => this.followRedirections(redirectUrl, depth)),
    );
    return Array.from(new Set([].concat(...allRedirects)));
  }

  /**
   * 도메인이 스팸 목록에 있는지 확인합니다.
   * @param {string} url - 확인할 URL.
   * @param {string[]} spamLinkDomains - 스팸으로 간주되는 도메인 목록.
   * @returns {boolean} - URL이 스팸 도메인에 속하는 경우 true, 아닌 경우 false.
   */
  private isDomainSpam(url: string, spamLinkDomains: string[]): boolean {
    try {
      const { hostname } = new URL(url);

      return spamLinkDomains.includes(hostname);
    } catch {
      return false;
    }
  }
}
