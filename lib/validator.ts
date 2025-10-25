import { AtlassianTransaction, TransactionValidationResult, ValidationIssue, AppPricing } from '../types';
import { PricingFetcher } from './pricing-fetcher';

export class TransactionValidator {
  private pricingFetcher: PricingFetcher;
  private partnerCutPercentage: number;
  private tableGridAppKeys = [
    'com.idalko.confluence.plugins.tablegrid',
    'com.idalko.table-grid',
  ]; // Table Grid Next Generation app keys

  constructor(partnerCutPercentage: number = 20) {
    this.pricingFetcher = new PricingFetcher();
    this.partnerCutPercentage = partnerCutPercentage;
  }

  /**
   * Validate a single transaction
   */
  async validateTransaction(transaction: AtlassianTransaction): Promise<TransactionValidationResult> {
    const issues: ValidationIssue[] = [];
    const checks = {
      priceCorrect: true,
      discountExplained: true,
      partnerCutCorrect: true,
    };

    // Fetch pricing information for the app
    const appPricing = await this.pricingFetcher.getAppPricing(transaction.addonKey);

    // 1. Validate price
    const priceIssues = await this.validatePrice(transaction, appPricing);
    if (priceIssues.length > 0) {
      checks.priceCorrect = false;
      issues.push(...priceIssues);
    }

    // 2. Validate discount explanations
    const discountIssues = this.validateDiscounts(transaction);
    if (discountIssues.length > 0) {
      checks.discountExplained = false;
      issues.push(...discountIssues);
    }

    // 3. Validate partner cut (only for Table Grid Next Generation)
    const partnerCutIssues = this.validatePartnerCut(transaction);
    if (partnerCutIssues.length > 0) {
      checks.partnerCutCorrect = false;
      issues.push(...partnerCutIssues);
    }

    return {
      transactionId: transaction.transactionId,
      addonKey: transaction.addonKey,
      addonName: transaction.addonName,
      saleDate: transaction.saleDate,
      isValid: issues.length === 0,
      issues,
      checks,
    };
  }

  /**
   * Validate multiple transactions
   */
  async validateTransactions(transactions: AtlassianTransaction[]): Promise<TransactionValidationResult[]> {
    const results: TransactionValidationResult[] = [];

    for (const transaction of transactions) {
      try {
        const result = await this.validateTransaction(transaction);
        results.push(result);
      } catch (error) {
        console.error(`Error validating transaction ${transaction.transactionId}:`, error);
        results.push({
          transactionId: transaction.transactionId,
          addonKey: transaction.addonKey,
          addonName: transaction.addonName,
          saleDate: transaction.saleDate,
          isValid: false,
          issues: [{
            severity: 'error',
            type: 'price',
            message: `Validation failed: ${error}`,
          }],
          checks: {
            priceCorrect: false,
            discountExplained: false,
            partnerCutCorrect: false,
          },
        });
      }
    }

    return results;
  }

  /**
   * Validate that the price is correct based on the tier and platform
   */
  private async validatePrice(
    transaction: AtlassianTransaction,
    appPricing: AppPricing | null
  ): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    if (!appPricing) {
      issues.push({
        severity: 'warning',
        type: 'price',
        message: 'Could not fetch pricing information from marketplace listing',
        details: {
          addonKey: transaction.addonKey,
        },
      });
      return issues;
    }

    if (!transaction.licenseTier || !transaction.platform) {
      issues.push({
        severity: 'warning',
        type: 'price',
        message: 'Missing license tier or platform information',
        details: {
          licenseTier: transaction.licenseTier,
          platform: transaction.platform,
        },
      });
      return issues;
    }

    const expectedPrice = this.pricingFetcher.getPriceForTier(
      appPricing,
      transaction.licenseTier,
      transaction.platform
    );

    if (expectedPrice === null) {
      issues.push({
        severity: 'warning',
        type: 'price',
        message: `Could not find pricing for tier "${transaction.licenseTier}" on platform "${transaction.platform}"`,
        details: {
          licenseTier: transaction.licenseTier,
          platform: transaction.platform,
        },
      });
      return issues;
    }

    // Calculate expected vendor amount after discounts
    const totalCharged = transaction.totalAmountCharged || 0;
    const totalDiscounts = (transaction.discounts || [])
      .reduce((sum, d) => sum + d.amount, 0);
    const expectedTotal = expectedPrice - totalDiscounts;

    // Allow for small rounding differences (within $0.02)
    const tolerance = 0.02;
    const actualTotal = totalCharged;

    if (Math.abs(actualTotal - expectedTotal) > tolerance) {
      issues.push({
        severity: 'error',
        type: 'price',
        message: 'Price does not match expected amount',
        details: {
          expectedPrice,
          actualPrice: actualTotal,
          difference: actualTotal - expectedTotal,
          licenseTier: transaction.licenseTier,
          platform: transaction.platform,
        },
      });
    }

    return issues;
  }

  /**
   * Validate that manual discounts have explanations
   */
  private validateDiscounts(transaction: AtlassianTransaction): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!transaction.discounts || transaction.discounts.length === 0) {
      return issues; // No discounts, nothing to validate
    }

    for (const discount of transaction.discounts) {
      // Check if this is a manual discount (not automatic/promotional)
      const isManualDiscount =
        discount.type.toLowerCase().includes('manual') ||
        discount.type.toLowerCase().includes('custom') ||
        discount.type.toLowerCase() === 'other';

      if (isManualDiscount) {
        if (!discount.reason || discount.reason.trim().length === 0) {
          issues.push({
            severity: 'error',
            type: 'discount',
            message: 'Manual discount missing explanation',
            details: {
              discountAmount: discount.amount,
              discountType: discount.type,
            },
          });
        } else if (discount.reason.trim().length < 10) {
          issues.push({
            severity: 'warning',
            type: 'discount',
            message: 'Discount explanation is too brief',
            details: {
              discountAmount: discount.amount,
              discountType: discount.type,
              reason: discount.reason,
            },
          });
        }
      }
    }

    return issues;
  }

  /**
   * Validate partner cut (only for Table Grid Next Generation)
   */
  private validatePartnerCut(transaction: AtlassianTransaction): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check if this is a Table Grid Next Generation transaction
    const isTableGrid = this.tableGridAppKeys.some(key =>
      transaction.addonKey.toLowerCase().includes(key.toLowerCase())
    );

    if (!isTableGrid) {
      return issues; // Not Table Grid, skip partner cut validation
    }

    // If it's Table Grid and there's no partner details, that's fine
    // Partner cut only applies if there's actually a partner involved
    if (!transaction.partnerDetails || !transaction.partnerDetails.partnerAmount) {
      return issues;
    }

    const vendorAmount = transaction.vendorAmount || 0;
    const partnerAmount = transaction.partnerDetails.partnerAmount;
    const expectedPartnerAmount = vendorAmount * (this.partnerCutPercentage / 100);

    // Allow for small rounding differences
    const tolerance = 0.02;

    if (Math.abs(partnerAmount - expectedPartnerAmount) > tolerance) {
      issues.push({
        severity: 'error',
        type: 'partner_cut',
        message: `Partner cut is incorrect (expected ${this.partnerCutPercentage}%)`,
        details: {
          vendorAmount,
          expectedPartnerAmount,
          actualPartnerAmount: partnerAmount,
          difference: partnerAmount - expectedPartnerAmount,
          partnerName: transaction.partnerDetails.partnerName,
        },
      });
    }

    return issues;
  }
}
