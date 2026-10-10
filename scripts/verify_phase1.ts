import { DatabaseSync } from 'node:sqlite';

const BASE_URL = 'http://localhost:3000';

async function testPhase1() {
  console.log('=== STARTING PHASE 1 VERIFICATION ===\n');

  // 1. CONTACT FORM: Validation failure tests
  console.log('--- 1. Testing Contact Form Validation ---');
  const resBadContact = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'A', // too short
      phone: '123', // too short
      email: 'not-an-email',
      message: 'hi', // too short
    }),
  });
  const dataBadContact = await resBadContact.json();
  if (resBadContact.status === 400 && dataBadContact.error) {
    console.log('✓ Contact validation failure correctly caught:', dataBadContact.error);
  } else {
    throw new Error(`Expected 400 validation failure, got ${resBadContact.status}`);
  }

  // 2. CONTACT FORM: Successful submission
  console.log('\n--- 2. Testing Contact Form Valid Submission ---');
  const testContactIdem = `test_contact_${Date.now()}`;
  const resValidContact = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Devanshi Shah',
      phone: '+91 98200 11223',
      email: 'devanshi.shah@example.com',
      subject: 'Bespoke Drapery & Blinds',
      message: 'Looking for double-height sheer and motorized blackout curtains for our living room.',
      idempotencyKey: testContactIdem,
    }),
  });

  if (resValidContact.status !== 201) {
    throw new Error(`Expected 201 Created, got ${resValidContact.status}: ${await resValidContact.text()}`);
  }

  const dataValidContact = await resValidContact.json();
  console.log('✓ Contact inquiry created via API:', {
    id: dataValidContact.inquiry?.id,
    inquiryNumber: dataValidContact.inquiry?.inquiry_number,
    name: dataValidContact.inquiry?.name,
    subject: dataValidContact.inquiry?.subject,
    status: dataValidContact.inquiry?.status,
  });

  // Verify persistence in SQLite
  const db = new DatabaseSync('data/zaira.db');
  const contactRow = db.prepare('SELECT * FROM contact_inquiries WHERE id = ?').get(dataValidContact.inquiry.id) as any;
  if (!contactRow || contactRow.inquiry_number !== dataValidContact.inquiry.inquiry_number) {
    throw new Error('Failed to verify contact inquiry in SQLite database!');
  }
  console.log('✓ SQLite Persistence verified for contact inquiry:', {
    id: contactRow.id,
    inquiry_number: contactRow.inquiry_number,
    phone: contactRow.phone,
    email: contactRow.email,
    created_at: contactRow.created_at,
  });

  // Test idempotency
  const resContactDup = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Devanshi Shah',
      phone: '+91 98200 11223',
      email: 'devanshi.shah@example.com',
      subject: 'Bespoke Drapery & Blinds',
      message: 'Looking for double-height sheer and motorized blackout curtains for our living room.',
      idempotencyKey: testContactIdem,
    }),
  });
  const dataContactDup = await resContactDup.json();
  if (dataContactDup.duplicate === true && dataContactDup.inquiry?.id === contactRow.id) {
    console.log('✓ Idempotency verified: Duplicate submission recognized without re-inserting');
  } else {
    throw new Error('Idempotency check failed for contact inquiries');
  }

  // 3. CONSULTATION FORM: Validation failure tests
  console.log('\n--- 3. Testing Consultation Form Validation ---');
  const resBadConsult = await fetch(`${BASE_URL}/api/measurement-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Karan',
      phone: '123', // invalid phone
      serviceRequested: 'Free In-Home Measurement / Site Visit',
    }),
  });
  const dataBadConsult = await resBadConsult.json();
  if (resBadConsult.status === 400 && dataBadConsult.error) {
    console.log('✓ Consultation validation failure correctly caught:', dataBadConsult.error);
  } else {
    throw new Error(`Expected 400 validation failure, got ${resBadConsult.status}`);
  }

  // 4. CONSULTATION FORM: Successful submission
  console.log('\n--- 4. Testing Consultation Form Valid Submission ---');
  const testConsultIdem = `test_consult_${Date.now()}`;
  const resValidConsult = await fetch(`${BASE_URL}/api/measurement-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Karan Mehta',
      customerPhone: '+91 98199 88776',
      serviceRequested: 'Free In-Home Measurement / Site Visit',
      address: 'Villa 14, Silver Oak Residences, Jubilee Hills',
      preferredDate: 'Next Saturday Morning',
      preferredTimeSlot: 'Showroom Coordinated',
      customerNotes: 'Service: Free In-Home Measurement / Site Visit\nTimeframe: Next Saturday Morning\nProject Scope & Location: Villa 14, Silver Oak Residences, Jubilee Hills. 6 master bedroom windows.',
      idempotencyKey: testConsultIdem,
    }),
  });

  if (resValidConsult.status !== 201) {
    throw new Error(`Expected 201 Created for consultation, got ${resValidConsult.status}: ${await resValidConsult.text()}`);
  }

  const dataValidConsult = await resValidConsult.json();
  console.log('✓ Consultation request created via /api/measurement-requests:', {
    id: dataValidConsult.measurementRequest?.id,
    requestNumber: dataValidConsult.measurementRequest?.request_number,
    customerName: dataValidConsult.measurementRequest?.customer_name,
    productNameSnapshot: dataValidConsult.measurementRequest?.product_name_snapshot,
    status: dataValidConsult.measurementRequest?.status,
  });

  // Verify persistence in SQLite
  const consultRow = db.prepare('SELECT * FROM measurement_requests WHERE id = ?').get(dataValidConsult.measurementRequest.id) as any;
  if (!consultRow || consultRow.request_number !== dataValidConsult.measurementRequest.request_number) {
    throw new Error('Failed to verify consultation request in SQLite database!');
  }
  console.log('✓ SQLite Persistence verified for consultation request:', {
    id: consultRow.id,
    request_number: consultRow.request_number,
    product_name_snapshot: consultRow.product_name_snapshot,
    address: consultRow.address,
    preferred_date: consultRow.preferred_date,
    status: consultRow.status,
  });

  // 5. Verify customer pages HTTP status
  console.log('\n--- 5. Verifying Customer Pages Accessibility ---');
  const pagesToTest = ['/contact', '/services', '/', '/products/blackout-curtains', '/cart', '/checkout'];
  for (const page of pagesToTest) {
    const pageRes = await fetch(`${BASE_URL}${page}`);
    if (pageRes.status === 200) {
      console.log(`✓ Page ${page} responded with HTTP 200 OK`);
    } else {
      throw new Error(`Page ${page} returned HTTP ${pageRes.status}`);
    }
  }

  db.close();
  console.log('\n=== ALL PHASE 1 VERIFICATIONS PASSED SUCCESSFULLY ===');
}

testPhase1().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
