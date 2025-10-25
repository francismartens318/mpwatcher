export interface AtlassianTransaction {
  transactionId: string;
  addonKey: string;
  addonName: string;
  saleDate: string;
  billingPeriod: string;
  customerDetails?: {
    country?: string;
    region?: string;
  };
  licenseTier?: string;
  platform?: string; // 'Cloud', 'Server', 'Data Center'
  maintenanceStartDate?: string;
  maintenanceEndDate?: string;
  saleType?: string;
  vendorAmount: number;
  partnerDiscountAmount?: number;
  totalAmountCharged?: number;
  discounts?: {
    amount: number;
    type: string;
    reason?: string;
  }[];
  partnerDetails?: {
    partnerName?: string;
    partnerAmount?: number;
  };
}

export interface PricingTier {
  userCount: string; // e.g., "1-10", "11-25", "500-1000"
  price: number;
  platform: string;
}

export interface AppPricing {
  appKey: string;
  appName: string;
  pricingTiers: PricingTier[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  type: 'price' | 'discount' | 'partner_cut';
  message: string;
  details?: Record<string, any>;
}

export interface TransactionValidationResult {
  transactionId: string;
  addonKey: string;
  addonName: string;
  saleDate: string;
  isValid: boolean;
  issues: ValidationIssue[];
  checks: {
    priceCorrect: boolean;
    discountExplained: boolean;
    partnerCutCorrect: boolean;
  };
}

export interface ValidationReport {
  generatedAt: string;
  totalTransactions: number;
  validTransactions: number;
  invalidTransactions: number;
  results: TransactionValidationResult[];
  summary: {
    priceIssues: number;
    discountIssues: number;
    partnerCutIssues: number;
  };
}
