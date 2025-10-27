import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppPricing, PricingTier } from '../types';

export class PricingFetcher {
  private cache: Map<string, AppPricing> = new Map();

  /**
   * Fetch pricing information for an app from the marketplace listing
   * @param appKey - The app key (e.g., 'com.example.myapp')
   */
  async getAppPricing(appKey: string): Promise<AppPricing | null> {
    // Check cache first
    if (this.cache.has(appKey)) {
      return this.cache.get(appKey)!;
    }

    try {
      // Try to fetch from marketplace listing page
      const cloudPricing = await this.fetchMarketplacePricing(appKey, 'cloud');
      const serverPricing = await this.fetchMarketplacePricing(appKey, 'server');
      const dcPricing = await this.fetchMarketplacePricing(appKey, 'datacenter');

      const allPricing = [
        ...(cloudPricing || []),
        ...(serverPricing || []),
        ...(dcPricing || []),
      ];

      if (allPricing.length === 0) {
        console.warn(`No pricing found for app: ${appKey}`);
        return null;
      }

      const appPricing: AppPricing = {
        appKey,
        appName: appKey, // Will be updated when we fetch the name
        pricingTiers: allPricing,
      };

      this.cache.set(appKey, appPricing);
      return appPricing;
    } catch (error) {
      console.error(`Error fetching pricing for ${appKey}:`, error);
      return null;
    }
  }

  private async fetchMarketplacePricing(
    appKey: string,
    platform: 'cloud' | 'server' | 'datacenter'
  ): Promise<PricingTier[]> {
    try {
      // Construct marketplace URL
      const url = `https://marketplace.atlassian.com/apps/${appKey}?tab=pricing&hosting=${platform}`;

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MPWatcher/1.0)',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);
      const pricingTiers: PricingTier[] = [];

      // Parse pricing table - this is a best-effort scraping
      // The actual selectors may need adjustment based on marketplace HTML structure
      $('.pricing-table tr, .price-table tr, [data-testid*="pricing"] tr').each((_, row) => {
        const $row = $(row);
        const userCount = $row.find('td:first-child, th:first-child').text().trim();
        const priceText = $row.find('td:last-child, td:nth-child(2)').text().trim();

        // Extract price from text like "$10.00" or "USD 10.00"
        const priceMatch = priceText.match(/[\$\€\£]?\s*(\d+(?:\.\d{2})?)/);

        if (userCount && priceMatch) {
          const price = parseFloat(priceMatch[1]);

          pricingTiers.push({
            userCount: this.normalizeUserCount(userCount),
            price,
            platform: this.normalizePlatform(platform),
          });
        }
      });

      return pricingTiers;
    } catch (error: any) {
      // Handle 404 errors separately (app doesn't exist or not available for this platform)
      if (error.response?.status === 404) {
        console.warn(`App not found for ${platform}: ${appKey} (this is expected if the app is not available on ${platform})`);
      } else {
        // Log other errors with more detail
        console.error(`Error fetching ${platform} pricing for ${appKey}:`, error.message || error);
      }
      return [];
    }
  }

  private normalizeUserCount(userCount: string): string {
    // Normalize user count strings
    // "Up to 10 users" -> "1-10"
    // "11-25 users" -> "11-25"
    // "500+" -> "501-1000"

    const match = userCount.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }

    const upToMatch = userCount.match(/up\s+to\s+(\d+)/i);
    if (upToMatch) {
      return `1-${upToMatch[1]}`;
    }

    const plusMatch = userCount.match(/(\d+)\+/);
    if (plusMatch) {
      const base = parseInt(plusMatch[1]);
      return `${base + 1}-${base * 2}`;
    }

    return userCount;
  }

  private normalizePlatform(platform: string): string {
    const normalized = platform.toLowerCase();
    if (normalized.includes('cloud')) return 'Cloud';
    if (normalized.includes('server')) return 'Server';
    if (normalized.includes('datacenter') || normalized.includes('data center')) return 'Data Center';
    return platform;
  }

  /**
   * Get expected price for a specific tier and platform
   */
  getPriceForTier(pricing: AppPricing, licenseTier: string, platform: string): number | null {
    const normalizedPlatform = this.normalizePlatform(platform);
    const normalizedTier = this.normalizeUserCount(licenseTier);

    const tier = pricing.pricingTiers.find(
      t => t.userCount === normalizedTier && t.platform === normalizedPlatform
    );

    return tier ? tier.price : null;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
