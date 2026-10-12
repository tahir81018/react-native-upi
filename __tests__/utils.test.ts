import { parseUPIResponse, isPaymentSuccessful } from '../src/utils';
import { UPI_STATUS } from '../src/constants';

describe('parseUPIResponse', () => {
  it('correctly parses a standard successful Google Pay / UPI response', () => {
    const raw =
      'txnId=UPI123456789&responseCode=0&ApprovalRefNo=123456789012&Status=SUCCESS&txnRef=TXN12345';
    const result = parseUPIResponse(raw);

    expect(result.status).toBe(UPI_STATUS.SUCCESS);
    expect(result.txnId).toBe('UPI123456789');
    expect(result.responseCode).toBe('0');
    expect(result.approvalRefNo).toBe('123456789012');
    expect(result.txnRef).toBe('TXN12345');
    expect(result.rawResponse).toBe(raw);
  });

  it('correctly parses a failed UPI transaction response', () => {
    const raw = 'txnId=UPI999&responseCode=ZM&Status=FAILURE&txnRef=TXN_FAILED';
    const result = parseUPIResponse(raw);

    expect(result.status).toBe(UPI_STATUS.FAILURE);
    expect(result.txnId).toBe('UPI999');
    expect(result.responseCode).toBe('ZM');
    expect(result.txnRef).toBe('TXN_FAILED');
  });

  it('correctly parses a submitted / pending status', () => {
    const raw = 'Status=SUBMITTED&txnId=UPI555&txnRef=TXN_PENDING';
    const result = parseUPIResponse(raw);

    expect(result.status).toBe(UPI_STATUS.SUBMITTED);
    expect(result.txnId).toBe('UPI555');
  });

  it('handles case-insensitive keys and status values', () => {
    const raw =
      'status=successful&txnid=UPI_LOWER&approvalrefno=REF999&responsecode=00&txnref=REF_TEST';
    const result = parseUPIResponse(raw);

    expect(result.status).toBe(UPI_STATUS.SUCCESS);
    expect(result.txnId).toBe('UPI_LOWER');
    expect(result.approvalRefNo).toBe('REF999');
    expect(result.responseCode).toBe('00');
    expect(result.txnRef).toBe('REF_TEST');
  });

  it('handles URL-encoded values', () => {
    const raw = 'Status=SUCCESS&note=Payment%20for%20order%23123';
    const result = parseUPIResponse(raw);

    expect(result.status).toBe(UPI_STATUS.SUCCESS);
    expect(result.note).toBe('Payment for order#123');
  });

  it('handles empty, null, or malformed strings gracefully', () => {
    const resultEmpty = parseUPIResponse('');
    expect(resultEmpty.status).toBe(UPI_STATUS.FAILURE);
    expect(resultEmpty.rawResponse).toBe('');

    // @ts-expect-error test non-string input
    const resultNull = parseUPIResponse(null);
    expect(resultNull.status).toBe(UPI_STATUS.FAILURE);

    const resultMalformed = parseUPIResponse('malformed-string-without-equal');
    expect(resultMalformed.status).toBe(UPI_STATUS.FAILURE);
  });
});

describe('isPaymentSuccessful', () => {
  it('returns true for successful response object', () => {
    expect(
      isPaymentSuccessful({
        status: UPI_STATUS.SUCCESS,
        rawResponse: 'Status=SUCCESS',
      })
    ).toBe(true);
  });

  it('returns true for successful raw string', () => {
    expect(isPaymentSuccessful('Status=SUCCESS&txnId=123')).toBe(true);
  });

  it('returns false for failure, cancelled, or pending status', () => {
    expect(isPaymentSuccessful('Status=FAILURE&txnId=123')).toBe(false);
    expect(isPaymentSuccessful('Status=SUBMITTED&txnId=123')).toBe(false);
    expect(
      isPaymentSuccessful({
        status: UPI_STATUS.FAILURE,
        rawResponse: 'Status=FAILURE',
      })
    ).toBe(false);
  });
});
