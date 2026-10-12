import { UPIPaymentResponse, UPIStatus } from './types';
import { UPI_STATUS } from './constants';

/**
 * Safely decodes a URI component without throwing URIError on malformed strings.
 */
function safeDecode(val: string): string {
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
}

/**
 * Parses a raw response string from a UPI Intent response into a structured object.
 *
 * Example inputs:
 * - "txnId=UPI123456789&responseCode=0&ApprovalRefNo=123456789012&Status=SUCCESS&txnRef=TXN12345"
 * - "upi://response?Status=SUCCESS&txnId=UPI123"
 * - "SUCCESS"
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

  const trimmed = rawResponse.trim();

  // Check if response is directly a status keyword
  const upperTrimmed = trimmed.toUpperCase();
  if (upperTrimmed === 'SUCCESS' || upperTrimmed === 'SUCCESSFUL') {
    result.status = UPI_STATUS.SUCCESS;
    return result;
  } else if (upperTrimmed === 'SUBMITTED') {
    result.status = UPI_STATUS.SUBMITTED;
    return result;
  } else if (upperTrimmed === 'FAILURE' || upperTrimmed === 'FAILED' || upperTrimmed === 'FAIL') {
    result.status = UPI_STATUS.FAILURE;
    return result;
  }

  // Strip URI schema if present (e.g. upi://response?key=val)
  let queryString = trimmed;
  const qIdx = queryString.indexOf('?');
  if (qIdx !== -1) {
    queryString = queryString.substring(qIdx + 1);
  }

  const pairs = queryString.split('&');
  for (const pair of pairs) {
    if (!pair.trim()) continue;
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) {
      continue;
    }

    const key = pair.substring(0, eqIdx).trim();
    const value = safeDecode(pair.substring(eqIdx + 1).trim());

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
    } else if (lowerKey === 'txnid' || lowerKey === 'transactionid') {
      result.txnId = value;
    } else if (lowerKey === 'txnref' || lowerKey === 'transactionref') {
      result.txnRef = value;
    } else if (lowerKey === 'responsecode' || lowerKey === 'rc') {
      result.responseCode = value;
    } else if (
      lowerKey === 'approvalrefno' ||
      lowerKey === 'approvalref' ||
      lowerKey === 'apprno'
    ) {
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
