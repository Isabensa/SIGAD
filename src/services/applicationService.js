export function submitApplication(pb, data) {
  return pb.collection('solicitudes').create(data, { requestKey: null });
}

export function getApplications(pb) {
  return pb.collection('solicitudes').getFullList({ sort: '-created', requestKey: null });
}

export function getPublicApplicationStatus(pb, credentials) {
  return pb.send('/api/sigad/applications/status', {
    method: 'POST',
    body: credentials,
    requestKey: null
  });
}

export function approveApplication(pb, id, observacionAdmin = '') {
  return pb.send(`/api/sigad/applications/${id}/approve`, { method: 'POST', body: { observacionAdmin }, requestKey: null });
}

export function rejectApplication(pb, id, observacionAdmin) {
  return pb.send(`/api/sigad/applications/${id}/reject`, { method: 'POST', body: { observacionAdmin }, requestKey: null });
}

export async function openApplicationReceipt(pb, application) {
  const token = await pb.files.getToken();
  window.open(pb.files.getURL(application, application.comprobante, { token }), '_blank', 'noopener,noreferrer');
}
