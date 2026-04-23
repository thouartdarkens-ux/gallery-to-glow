
UPDATE students SET residency='Boarding' WHERE student_id IN ('STU-2025-001','STU-2025-003','STU-2025-005','STU-2025-007','STU-2025-009');
UPDATE students SET is_scholarship=true WHERE student_id='STU-2025-004';
UPDATE students SET is_free_shs=true WHERE student_id='STU-2025-008';
UPDATE students SET current_class_level='SHS 3' WHERE class_id IN ('a1000000-0000-0000-0000-000000000005','a1000000-0000-0000-0000-000000000006');
UPDATE students SET current_class_level='SHS 2' WHERE class_id IN ('a1000000-0000-0000-0000-000000000003','a1000000-0000-0000-0000-000000000004');
UPDATE students SET current_class_level='SHS 1' WHERE class_id IN ('a1000000-0000-0000-0000-000000000001','a1000000-0000-0000-0000-000000000002');

INSERT INTO student_tags (student_id, tag) VALUES
 ('b1000000-0000-0000-0000-000000000001','Debtors'),
 ('b1000000-0000-0000-0000-000000000002','Debtors'),
 ('b1000000-0000-0000-0000-000000000003','Sports'),
 ('b1000000-0000-0000-0000-000000000005','Finalists'),
 ('b1000000-0000-0000-0000-000000000007','Finalists'),
 ('b1000000-0000-0000-0000-000000000009','Finalists'),
 ('b1000000-0000-0000-0000-000000000010','Finalists')
ON CONFLICT DO NOTHING;

INSERT INTO fee_records (student_id, academic_year, term, total_fee, amount_paid, notes) VALUES
 ('b1000000-0000-0000-0000-000000000001','2025/2026','Term 1', 3500, 0, 'Boarding fees'),
 ('b1000000-0000-0000-0000-000000000002','2025/2026','Term 1', 2500, 1200, 'Day student'),
 ('b1000000-0000-0000-0000-000000000003','2025/2026','Term 1', 3500, 3500, 'Fully paid'),
 ('b1000000-0000-0000-0000-000000000004','2025/2026','Term 1', 2500, 2500, 'Scholarship'),
 ('b1000000-0000-0000-0000-000000000005','2025/2026','Term 1', 3500, 1500, 'Boarding partial'),
 ('b1000000-0000-0000-0000-000000000006','2025/2026','Term 1', 2500, 0, 'Owing'),
 ('b1000000-0000-0000-0000-000000000007','2025/2026','Term 1', 3500, 3500, 'Final year cleared'),
 ('b1000000-0000-0000-0000-000000000008','2025/2026','Term 1', 2500, 2500, 'Free SHS'),
 ('b1000000-0000-0000-0000-000000000009','2025/2026','Term 1', 3500, 800, 'Finalist partial'),
 ('b1000000-0000-0000-0000-000000000010','2025/2026','Term 1', 2500, 2500, 'Paid');

INSERT INTO payment_events (student_id, amount, reference, sms_sent) VALUES
 ('b1000000-0000-0000-0000-000000000002', 1200, 'PMT-001', true),
 ('b1000000-0000-0000-0000-000000000003', 3500, 'PMT-002', true),
 ('b1000000-0000-0000-0000-000000000005', 1500, 'PMT-003', true),
 ('b1000000-0000-0000-0000-000000000007', 3500, 'PMT-004', true),
 ('b1000000-0000-0000-0000-000000000009', 800, 'PMT-005', false),
 ('b1000000-0000-0000-0000-000000000010', 2500, 'PMT-006', true);

INSERT INTO contact_groups (id, name, description, type, is_dynamic) VALUES
 ('c1000000-0000-0000-0000-000000000001','All Parents','Every parent in school','custom',true),
 ('c1000000-0000-0000-0000-000000000002','Form 3 Parents','Final-year parents','class',true),
 ('c1000000-0000-0000-0000-000000000003','Debtors','Outstanding fees','debtors',true),
 ('c1000000-0000-0000-0000-000000000004','PTA Executives','PTA members','pta',false),
 ('c1000000-0000-0000-0000-000000000005','Boarding Students','All boarders','boarding',true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO group_members (group_id, student_id) VALUES
 ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000007'),
 ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000008'),
 ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000009'),
 ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000010'),
 ('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000001'),
 ('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000002'),
 ('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000006');

INSERT INTO whatsapp_messages (recipient_phone, recipient_name, body, status, direction, delivered_at) VALUES
 ('+233241234567','Mr. Mensah','Dear parent, fees for Term 1 are due. Balance: GHS 1300','delivered','outbound', now() - interval '2 hours'),
 ('+233241234568','Mrs. Boateng','Payment of GHS 3500 received. Thank you!','read','outbound', now() - interval '1 day'),
 ('+233241234569','Mr. Asante','PTA meeting Saturday 10am.','sent','outbound', now() - interval '3 hours'),
 ('+233241234570','Mr. Darko','Thank you. We will attend.','delivered','inbound', now() - interval '30 minutes'),
 ('+233241234571','Mrs. Adjei','Final year graduation rehearsal Friday 2pm.','delivered','outbound', now() - interval '5 hours');

UPDATE parents SET phone_primary = phone WHERE phone_primary IS NULL;

UPDATE sms_wallet SET balance = 500.00 WHERE balance < 100;
INSERT INTO wallet_transactions (type, amount, balance_before, balance_after, description, reference) VALUES
 ('credit', 500, 0, 500, 'Initial top-up', 'TOPUP-001'),
 ('debit', 12.5, 500, 487.5, 'Campaign: Fee reminder', 'CAM-001'),
 ('debit', 8.75, 487.5, 478.75, 'Campaign: PTA notice', 'CAM-002');
