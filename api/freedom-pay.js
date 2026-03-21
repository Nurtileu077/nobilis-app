// =============================================
// FREEDOM PAY (PayBox) PAYMENT API
// =============================================
// Vercel Serverless Function for Freedom Pay integration
//
// Merchant API (hosted payment page) — no PCI DSS needed
// Docs: https://freedompay.kz/docs-en/gateway-api/intro
//
// Endpoints:
//   POST /api/freedom-pay              — init payment (returns redirect URL)
//   POST /api/freedom-pay?action=result — callback from Freedom Pay
//   POST /api/freedom-pay?action=status — check payment status
//   GET  /api/freedom-pay?action=success — success redirect
//   GET  /api/freedom-pay?action=failure — failure redirect

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const FREEDOM_MERCHANT_ID = process.env.FREEDOM_PAY_MERCHANT_ID;
const FREEDOM_SECRET_KEY = process.env.FREEDOM_PAY_SECRET_KEY;
const FREEDOM_API_URL = process.env.FREEDOM_PAY_TEST_MODE === 'true'
  ? 'https://test-api.freedompay.kz'
  : 'https://api.freedompay.kz';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

// =============================================
// SIGNATURE GENERATION (MD5)
// =============================================
// Concatenate: scriptName + sorted fields (with pg_salt) + secretKey
// separated by ";" — then MD5 hash

function generateSignature(scriptName, params, secretKey) {
  const sortedKeys = Object.keys(params).sort();
  const parts = [scriptName];
  for (const key of sortedKeys) {
    parts.push(params[key]);
  }
  parts.push(secretKey);
  const str = parts.join(';');
  return crypto.createHash('md5').update(str).digest('hex');
}

function verifySignature(scriptName, params, secretKey) {
  const receivedSig = params.pg_sig;
  const paramsWithoutSig = { ...params };
  delete paramsWithoutSig.pg_sig;
  const calculated = generateSignature(scriptName, paramsWithoutSig, secretKey);
  return calculated === receivedSig;
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// =============================================
// MAIN HANDLER
// =============================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const action = req.query.action || req.body?.action || 'init';

  try {
    switch (action) {
      case 'init':
        return await handleInitPayment(req, res);
      case 'result':
        return await handleResult(req, res);
      case 'status':
        return await handleStatusCheck(req, res);
      case 'success':
        return handleSuccessRedirect(req, res);
      case 'failure':
        return handleFailureRedirect(req, res);
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Freedom Pay API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// =============================================
// INIT PAYMENT — creates payment session
// =============================================
// POST /api/freedom-pay
// Body: { studentId, amount, description? }
// Returns: { paymentUrl, paymentId }

async function handleInitPayment(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId, amount, description } = req.body;

  if (!studentId || !amount) {
    return res.status(400).json({ error: 'studentId and amount are required' });
  }

  if (!FREEDOM_MERCHANT_ID || !FREEDOM_SECRET_KEY) {
    return res.status(500).json({ error: 'Freedom Pay not configured' });
  }

  // Find student
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, contract_no, profile:profiles!students_profile_id_fkey(name, email, phone)')
    .eq('id', studentId)
    .single();

  if (studentErr || !student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Create pending payment record
  const orderId = `NB-${Date.now()}-${studentId.slice(0, 8)}`;
  const { data: payment, error: paymentErr } = await supabase
    .from('payments')
    .insert({
      student_id: studentId,
      amount: parseFloat(amount),
      method: 'freedom_pay',
      note: `Order: ${orderId}. ${description || 'Оплата обучения'}`,
      receipt_url: `pending:${orderId}`,
      date: new Date().toISOString().split('T')[0],
      created_by: 'freedom-pay-api',
    })
    .select()
    .single();

  if (paymentErr) {
    return res.status(500).json({ error: 'Failed to create payment record' });
  }

  // Build Freedom Pay init request
  const pgSalt = generateSalt();
  const params = {
    pg_merchant_id: FREEDOM_MERCHANT_ID,
    pg_order_id: orderId,
    pg_amount: String(parseFloat(amount)),
    pg_currency: 'KZT',
    pg_description: description || `Оплата обучения — ${student.profile?.name || 'Студент'}`,
    pg_salt: pgSalt,
    pg_language: 'ru',
    pg_result_url: `${APP_URL}/api/freedom-pay?action=result`,
    pg_success_url: `${APP_URL}/api/freedom-pay?action=success&order=${orderId}`,
    pg_failure_url: `${APP_URL}/api/freedom-pay?action=failure&order=${orderId}`,
    pg_testing_mode: process.env.FREEDOM_PAY_TEST_MODE === 'true' ? '1' : '0',
    pg_user_phone: student.profile?.phone || '',
    pg_user_contact_email: student.profile?.email || '',
  };

  // Remove empty values
  Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });

  params.pg_sig = generateSignature('init_payment.php', params, FREEDOM_SECRET_KEY);

  // Call Freedom Pay API
  const formBody = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const fpResponse = await fetch(`${FREEDOM_API_URL}/init_payment.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
  });

  const fpText = await fpResponse.text();

  // Parse XML response
  const pgStatus = extractXmlValue(fpText, 'pg_status');
  const pgRedirectUrl = extractXmlValue(fpText, 'pg_redirect_url');
  const pgPaymentId = extractXmlValue(fpText, 'pg_payment_id');
  const pgErrorDescription = extractXmlValue(fpText, 'pg_error_description');

  if (pgStatus === 'error' || !pgRedirectUrl) {
    // Update payment as failed
    await supabase
      .from('payments')
      .update({ receipt_url: `failed:${orderId}`, note: `Ошибка: ${pgErrorDescription || 'Unknown'}` })
      .eq('id', payment.id);

    return res.status(400).json({
      error: pgErrorDescription || 'Failed to initialize payment',
      details: fpText,
    });
  }

  // Update payment with Freedom Pay ID
  await supabase
    .from('payments')
    .update({ receipt_url: `fp:${pgPaymentId || orderId}` })
    .eq('id', payment.id);

  return res.status(200).json({
    paymentUrl: pgRedirectUrl,
    paymentId: pgPaymentId,
    orderId,
    localPaymentId: payment.id,
  });
}

// =============================================
// RESULT CALLBACK — Freedom Pay notifies us
// =============================================
// POST /api/freedom-pay?action=result
// Freedom Pay sends payment result here

async function handleResult(req, res) {
  const params = req.body || {};

  // Verify signature
  if (FREEDOM_SECRET_KEY && params.pg_sig) {
    const valid = verifySignature('result', params, FREEDOM_SECRET_KEY);
    if (!valid) {
      console.error('Invalid signature from Freedom Pay');
      return res.status(200).send(xmlResponse('error', 'Invalid signature'));
    }
  }

  const orderId = params.pg_order_id;
  const pgResult = params.pg_result; // 1 = success, 0 = failure
  const pgPaymentId = params.pg_payment_id;
  const pgAmount = params.pg_amount;

  if (!orderId) {
    return res.status(200).send(xmlResponse('error', 'Missing order ID'));
  }

  // Find payment by order ID
  const { data: payment } = await supabase
    .from('payments')
    .select('id, student_id, amount')
    .ilike('note', `%${orderId}%`)
    .single();

  if (!payment) {
    return res.status(200).send(xmlResponse('error', 'Payment not found'));
  }

  if (pgResult === '1') {
    // Payment successful
    await supabase
      .from('payments')
      .update({
        receipt_url: `fp:${pgPaymentId}:success`,
        note: `Freedom Pay #${pgPaymentId}. Order: ${orderId}. Оплачено: ${pgAmount} KZT`,
      })
      .eq('id', payment.id);

    // Update student's paid_amount
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('student_id', payment.student_id)
      .ilike('receipt_url', '%success%');

    const totalPaid = (allPayments || []).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    await supabase
      .from('students')
      .update({ paid_amount: totalPaid })
      .eq('id', payment.student_id);

    // Add history
    await supabase
      .from('student_history')
      .insert({
        student_id: payment.student_id,
        text: `Платёж Freedom Pay: ${parseFloat(pgAmount).toLocaleString()} ₸ (ID: ${pgPaymentId})`,
        type: 'payment',
      });

    return res.status(200).send(xmlResponse('ok', 'Payment recorded'));
  } else {
    // Payment failed
    await supabase
      .from('payments')
      .update({ receipt_url: `fp:${pgPaymentId}:failed` })
      .eq('id', payment.id);

    return res.status(200).send(xmlResponse('ok', 'Failure recorded'));
  }
}

// =============================================
// STATUS CHECK — manual payment status query
// =============================================
// POST /api/freedom-pay?action=status
// Body: { orderId } or { paymentId }

async function handleStatusCheck(req, res) {
  const { orderId, paymentId } = req.body || req.query;

  if (!orderId && !paymentId) {
    return res.status(400).json({ error: 'orderId or paymentId required' });
  }

  if (!FREEDOM_MERCHANT_ID || !FREEDOM_SECRET_KEY) {
    return res.status(500).json({ error: 'Freedom Pay not configured' });
  }

  const pgSalt = generateSalt();
  const params = {
    pg_merchant_id: FREEDOM_MERCHANT_ID,
    pg_salt: pgSalt,
  };

  if (orderId) params.pg_order_id = orderId;
  if (paymentId) params.pg_payment_id = paymentId;

  params.pg_sig = generateSignature('get_status.php', params, FREEDOM_SECRET_KEY);

  const formBody = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const fpResponse = await fetch(`${FREEDOM_API_URL}/get_status.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
  });

  const fpText = await fpResponse.text();
  const status = extractXmlValue(fpText, 'pg_transaction_status');
  const amount = extractXmlValue(fpText, 'pg_amount');
  const createDate = extractXmlValue(fpText, 'pg_create_date');

  return res.status(200).json({
    status,
    amount,
    createDate,
    raw: fpText,
  });
}

// =============================================
// REDIRECT HANDLERS
// =============================================

function handleSuccessRedirect(req, res) {
  const orderId = req.query.order || '';
  return res.redirect(302, `${APP_URL}/?payment=success&order=${orderId}`);
}

function handleFailureRedirect(req, res) {
  const orderId = req.query.order || '';
  return res.redirect(302, `${APP_URL}/?payment=failed&order=${orderId}`);
}

// =============================================
// HELPERS
// =============================================

function extractXmlValue(xml, tag) {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function xmlResponse(status, description) {
  return `<?xml version="1.0" encoding="utf-8"?>
<response>
  <pg_status>${status}</pg_status>
  <pg_description>${description}</pg_description>
  <pg_salt>${generateSalt()}</pg_salt>
</response>`;
}
