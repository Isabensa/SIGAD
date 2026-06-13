export function getPayments(pb) {
  return pb.collection('pagos').getFullList({
    sort: '-created',
    expand: 'docenteId,revisadoPor',
    requestKey: null
  });
}

export function submitPayment(pb, data) {
  return pb.collection('pagos').create(data, { requestKey: null });
}

export function approvePayment(pb, id, observacionAdmin = '') {
  return pb.send(`/api/sigad/payments/${id}/approve`, {
    method: 'POST',
    body: { observacionAdmin },
    requestKey: null
  });
}

export function rejectPayment(pb, id, observacionAdmin) {
  return pb.send(`/api/sigad/payments/${id}/reject`, {
    method: 'POST',
    body: { observacionAdmin },
    requestKey: null
  });
}

export async function openPaymentReceipt(pb, payment) {
  const token = await pb.files.getToken();
  const url = pb.files.getURL(payment, payment.comprobante, { token });
  window.open(url, '_blank', 'noopener,noreferrer');
}
