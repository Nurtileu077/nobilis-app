// =============================================
// KASPI PAYMENT API ENDPOINT
// =============================================
// Vercel Serverless Function for Kaspi payment verification
//
// Kaspi sends payment notifications via webhook:
// POST /api/kaspi with payment data
//
// Also supports manual verification:
// GET /api/kaspi?txn_id=XXXXX&command=check
// GET /api/kaspi?txn_id=XXXXX&command=pay

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Kaspi merchant credentials
const KASPI_MERCHANT_ID = process.env.KASPI_MERCHANT_ID;
const KASPI_SECRET_KEY = process.env.KASPI_SECRET_KEY;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ---- GET: Kaspi check/pay protocol ----
    if (req.method === 'GET') {
      const { command, txn_id, account, sum, txn_date } = req.query;

      if (command === 'check') {
        // Kaspi asks: does this account exist?
        return await handleCheck(req, res, { account, sum, txn_id });
      }

      if (command === 'pay') {
        // Kaspi confirms: payment is done
        return await handlePay(req, res, { account, sum, txn_id, txn_date });
      }

      return res.status(400).json({
        txn_id,
        result: 1,
        comment: 'Unknown command',
      });
    }

    // ---- POST: Webhook notification ----
    if (req.method === 'POST') {
      return await handleWebhook(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Kaspi API error:', error);
    return res.status(500).json({
      result: 1,
      comment: 'Internal server error',
    });
  }
}

// Check if student account exists
async function handleCheck(req, res, { account, sum, txn_id }) {
  if (!account) {
    return res.status(200).json({
      txn_id,
      result: 5,
      comment: 'Account not provided',
    });
  }

  // account can be student contract number or login
  const { data: student, error } = await supabase
    .from('students')
    .select(`
      id, contract_no, total_contract_sum, paid_amount,
      profile:profiles!students_profile_id_fkey(name, login)
    `)
    .or(`contract_no.eq.${account},profile_id.in.(${await getProfileIdsByLogin(account)})`)
    .limit(1)
    .single();

  if (error || !student) {
    return res.status(200).json({
      txn_id,
      result: 5,
      comment: 'Student not found',
    });
  }

  const remaining = (student.total_contract_sum || 0) - (student.paid_amount || 0);

  return res.status(200).json({
    txn_id,
    result: 0,
    comment: 'OK',
    fields: {
      name: student.profile?.name || 'Student',
      contract: student.contract_no || '',
      balance: remaining,
    },
  });
}

// Process payment confirmation from Kaspi
async function handlePay(req, res, { account, sum, txn_id, txn_date }) {
  if (!account || !sum || !txn_id) {
    return res.status(200).json({
      txn_id,
      result: 1,
      comment: 'Missing required parameters',
    });
  }

  // Check for duplicate transaction
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('receipt_url', `kaspi:${txn_id}`)
    .single();

  if (existing) {
    return res.status(200).json({
      txn_id,
      result: 0,
      prv_txn: existing.id,
      comment: 'Already processed',
    });
  }

  // Find student
  const { data: student } = await supabase
    .from('students')
    .select('id, paid_amount, profile:profiles!students_profile_id_fkey(name)')
    .or(`contract_no.eq.${account}`)
    .limit(1)
    .single();

  if (!student) {
    return res.status(200).json({
      txn_id,
      result: 5,
      comment: 'Student not found',
    });
  }

  const amount = parseFloat(sum);

  // Record payment
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      student_id: student.id,
      amount,
      method: 'kaspi',
      receipt_url: `kaspi:${txn_id}`,
      note: `Kaspi auto-payment. TXN: ${txn_id}`,
      date: txn_date ? new Date(txn_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      created_by: 'kaspi-api',
    })
    .select()
    .single();

  if (paymentError) {
    return res.status(200).json({
      txn_id,
      result: 1,
      comment: 'Failed to record payment',
    });
  }

  // Update student paid amount
  const newPaid = (parseFloat(student.paid_amount) || 0) + amount;
  await supabase
    .from('students')
    .update({ paid_amount: newPaid })
    .eq('id', student.id);

  // Add history entry
  await supabase
    .from('student_history')
    .insert({
      student_id: student.id,
      text: `Платёж Kaspi: ${amount.toLocaleString()} ₸ (TXN: ${txn_id})`,
      type: 'payment',
    });

  return res.status(200).json({
    txn_id,
    prv_txn: payment.id,
    result: 0,
    comment: 'Payment recorded successfully',
  });
}

// Handle webhook notifications
async function handleWebhook(req, res) {
  const { event, data: paymentData } = req.body;

  if (event === 'payment.success') {
    const { txn_id, account, amount } = paymentData;
    return await handlePay(req, res, {
      account,
      sum: String(amount),
      txn_id,
      txn_date: new Date().toISOString(),
    });
  }

  return res.status(200).json({ result: 0, comment: 'Event acknowledged' });
}

// Helper to find profile IDs by login
async function getProfileIdsByLogin(login) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('login', login);
  return (data || []).map(p => `'${p.id}'`).join(',') || "'none'";
}
