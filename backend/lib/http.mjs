export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:3000',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

export function sendSuccess(res, statusCode, data) {
  sendJson(res, statusCode, { success: true, data });
}

export function sendError(res, statusCode, message, data) {
  sendJson(res, statusCode, { success: false, message, ...(data === undefined ? {} : { data }) });
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}
