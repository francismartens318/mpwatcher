import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  status: string;
  timestamp: string;
  config: {
    hasApiToken: boolean;
    hasDeveloperId: boolean;
    partnerCutPercentage: number;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const apiToken = process.env.ATLASSIAN_API_TOKEN;
  const developerId = process.env.ATLASSIAN_DEVELOPER_ID;
  const partnerCutPercentage = parseFloat(process.env.PARTNER_CUT_PERCENTAGE || '20');

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      hasApiToken: !!apiToken,
      hasDeveloperId: !!developerId,
      partnerCutPercentage,
    },
  });
}
