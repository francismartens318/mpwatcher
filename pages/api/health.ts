import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  status: string;
  timestamp: string;
  config: {
    hasEmail: boolean;
    hasApiToken: boolean;
    hasDeveloperId: boolean;
    partnerCutPercentage: number;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const email = process.env.ATLASSIAN_EMAIL;
  const apiToken = process.env.ATLASSIAN_API_TOKEN;
  const developerId = process.env.ATLASSIAN_DEVELOPER_ID;
  const partnerCutPercentage = parseFloat(process.env.PARTNER_CUT_PERCENTAGE || '20');

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      hasEmail: !!email,
      hasApiToken: !!apiToken,
      hasDeveloperId: !!developerId,
      partnerCutPercentage,
    },
  });
}
