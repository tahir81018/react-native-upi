import { UPIPaymentResponse, UPIStatus } from './types';
import { UPI_STATUS } from './constants';

/**
 * Parses a raw response string from a UPI Intent response into a structured object.
 *
 * Example input:
 * "txnId=UPI123456789&responseCode=0&ApprovalRefNo=123456789012&Status=SUCCESS&txnRef=TXN12345"
 *
 * @param rawResponse The raw string response from Android Intent.
 * @returns UPIPaymentResponse
 */
export function parseUPIResponse(rawResponse: string): UPIPaymentResponse {
  const result: UPIPaymentResponse = {
    status: UPI_STATUS.FAILURE,
    rawResponse: rawResponse || '',
  };

  if (!rawResponse || typeof rawResponse !== 'string') {
    return result;
  }

  const pairs = rawResponse.split('&');
  for (const pair of pairs) {
    if (!pair.trim()) continue;
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      continue;
    }

    const key = pair.substring(0, eqIdx).trim();
    const value = decodeURIComponent(pair.substring(eqIdx + 1).trim());

    // Keep original key-value
    result[key] = value;

    const lowerKey = key.toLowerCase();
    if (lowerKey === 'status') {
      const upperVal = value.toUpperCase();
      if (upperVal === 'SUCCESS' || upperVal === 'SUCCESSFUL') {
        result.status = UPI_STATUS.SUCCESS;
      } else if (upperVal === 'SUBMITTED') {
        result.status = UPI_STATUS.SUBMITTED;
      } else if (upperVal === 'FAILURE' || upperVal === 'FAILED' || upperVal === 'FAIL') {
        result.status = UPI_STATUS.FAILURE;
      } else {
        result.status = upperVal as UPIStatus;
      }
    } else if (lowerKey === 'txnid') {
      result.txnId = value;
    } else if (lowerKey === 'txnref') {
      result.txnRef = value;
    } else if (lowerKey === 'responsecode') {
      result.responseCode = value;
    } else if (lowerKey === 'approvalrefno') {
      result.approvalRefNo = value;
    }
  }

  return result;
}

/**
 * Helper to check whether a payment was successful.
 */
export function isPaymentSuccessful(response: UPIPaymentResponse | string): boolean {
  if (typeof response === 'string') {
    const parsed = parseUPIResponse(response);
    return parsed.status === UPI_STATUS.SUCCESS;
  }
  return response?.status === UPI_STATUS.SUCCESS;
}
