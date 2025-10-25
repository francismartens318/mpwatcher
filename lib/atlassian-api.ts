import axios, { AxiosInstance } from 'axios';
import { AtlassianTransaction } from '../types';

export class AtlassianMarketplaceAPI {
  private client: AxiosInstance;
  private developerId: string;

  constructor(email: string, apiToken: string, developerId: string) {
    this.developerId = developerId;
    this.client = axios.create({
      baseURL: 'https://marketplace.atlassian.com/rest',
      auth: {
        username: email,
        password: apiToken,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Fetch sales transactions for the developer
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @param appKey - Optional specific app key to filter
   */
  async getTransactions(
    startDate?: string,
    endDate?: string,
    appKey?: string
  ): Promise<AtlassianTransaction[]> {
    try {
      const params: any = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (appKey) params.addonKey = appKey;

      // Try v2 API first (uses vendor ID)
      let response;
      try {
        console.log('Trying v2 API endpoint...');
        response = await this.client.get(
          `/2/vendors/${this.developerId}/reporting/sales/transactions`,
          { params }
        );
      } catch (error: any) {
        // If v2 fails with 404, try v3 endpoint (from v4 documentation)
        if (error.response?.status === 404) {
          console.log('V2 endpoint returned 404, trying V3 endpoint...');
          response = await this.client.get(
            `/3/reporting/developer-space/${this.developerId}/sales/transactions`,
            { params }
          );
        } else {
          throw error;
        }
      }

      // Map the API response to our internal structure
      const transactions = response.data._embedded?.transactions || response.data.transactions || [];

      return transactions.map((t: any) => this.mapTransaction(t));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(`Failed to fetch transactions: ${error}`);
    }
  }

  private mapTransaction(apiTransaction: any): AtlassianTransaction {
    // Map Atlassian API response to our internal structure
    // Field names may vary based on actual API response
    return {
      transactionId: apiTransaction.transactionId || apiTransaction.id || '',
      addonKey: apiTransaction.addonKey || apiTransaction.appKey || '',
      addonName: apiTransaction.addonName || apiTransaction.appName || '',
      saleDate: apiTransaction.saleDate || apiTransaction.date || '',
      billingPeriod: apiTransaction.billingPeriod || 'monthly',
      customerDetails: {
        country: apiTransaction.customerDetails?.country,
        region: apiTransaction.customerDetails?.region,
      },
      licenseTier: apiTransaction.licenseTier || apiTransaction.tier,
      platform: apiTransaction.hostingType || apiTransaction.platform,
      maintenanceStartDate: apiTransaction.maintenanceStartDate,
      maintenanceEndDate: apiTransaction.maintenanceEndDate,
      saleType: apiTransaction.saleType || apiTransaction.transactionType,
      vendorAmount: parseFloat(apiTransaction.vendorAmount || apiTransaction.amount || '0'),
      partnerDiscountAmount: parseFloat(apiTransaction.partnerDiscountAmount || '0'),
      totalAmountCharged: parseFloat(apiTransaction.totalAmountCharged || apiTransaction.total || '0'),
      discounts: this.extractDiscounts(apiTransaction),
      partnerDetails: apiTransaction.partnerDetails ? {
        partnerName: apiTransaction.partnerDetails.partnerName,
        partnerAmount: parseFloat(apiTransaction.partnerDetails.partnerAmount || '0'),
      } : undefined,
    };
  }

  private extractDiscounts(apiTransaction: any): Array<{ amount: number; type: string; reason?: string }> {
    const discounts: Array<{ amount: number; type: string; reason?: string }> = [];

    // Check various possible discount fields
    if (apiTransaction.discountAmount || apiTransaction.discount) {
      discounts.push({
        amount: parseFloat(apiTransaction.discountAmount || apiTransaction.discount),
        type: apiTransaction.discountType || 'manual',
        reason: apiTransaction.discountReason || apiTransaction.discountExplanation || apiTransaction.discountNote,
      });
    }

    // Check if there's an array of discounts
    if (Array.isArray(apiTransaction.discounts)) {
      apiTransaction.discounts.forEach((d: any) => {
        discounts.push({
          amount: parseFloat(d.amount || '0'),
          type: d.type || 'unknown',
          reason: d.reason || d.explanation || d.note,
        });
      });
    }

    return discounts;
  }
}
