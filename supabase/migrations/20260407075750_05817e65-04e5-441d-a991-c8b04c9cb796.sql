
-- Insert demo classes
INSERT INTO classes (id, name, level, section, academic_year) VALUES
('a1000000-0000-0000-0000-000000000001', 'Form 1A', 'Form 1', 'A', '2025/2026'),
('a1000000-0000-0000-0000-000000000002', 'Form 1B', 'Form 1', 'B', '2025/2026'),
('a1000000-0000-0000-0000-000000000003', 'Form 2A', 'Form 2', 'A', '2025/2026'),
('a1000000-0000-0000-0000-000000000004', 'Form 2B', 'Form 2', 'B', '2025/2026'),
('a1000000-0000-0000-0000-000000000005', 'Form 3A', 'Form 3', 'A', '2025/2026'),
('a1000000-0000-0000-0000-000000000006', 'Form 3B', 'Form 3', 'B', '2025/2026');

-- Insert demo students
INSERT INTO students (id, student_id, name, class_id, program, status) VALUES
('b1000000-0000-0000-0000-000000000001', 'STU-2025-001', 'Kwame Asante', 'a1000000-0000-0000-0000-000000000001', 'General Science', 'Active'),
('b1000000-0000-0000-0000-000000000002', 'STU-2025-002', 'Ama Mensah', 'a1000000-0000-0000-0000-000000000001', 'General Arts', 'Active'),
('b1000000-0000-0000-0000-000000000003', 'STU-2025-003', 'Kofi Boateng', 'a1000000-0000-0000-0000-000000000002', 'Business', 'Active'),
('b1000000-0000-0000-0000-000000000004', 'STU-2025-004', 'Abena Osei', 'a1000000-0000-0000-0000-000000000003', 'General Science', 'Active'),
('b1000000-0000-0000-0000-000000000005', 'STU-2025-005', 'Yaw Darko', 'a1000000-0000-0000-0000-000000000003', 'Visual Arts', 'Active'),
('b1000000-0000-0000-0000-000000000006', 'STU-2025-006', 'Efua Adjei', 'a1000000-0000-0000-0000-000000000004', 'Home Economics', 'Active'),
('b1000000-0000-0000-0000-000000000007', 'STU-2025-007', 'Kwesi Ampah', 'a1000000-0000-0000-0000-000000000005', 'General Science', 'Active'),
('b1000000-0000-0000-0000-000000000008', 'STU-2025-008', 'Akosua Frimpong', 'a1000000-0000-0000-0000-000000000005', 'General Arts', 'Active'),
('b1000000-0000-0000-0000-000000000009', 'STU-2025-009', 'Nana Agyeman', 'a1000000-0000-0000-0000-000000000006', 'Business', 'Inactive'),
('b1000000-0000-0000-0000-000000000010', 'STU-2025-010', 'Adwoa Poku', 'a1000000-0000-0000-0000-000000000006', 'General Science', 'Active');

-- Insert demo parents
INSERT INTO parents (id, name, phone, phone_secondary, email, relationship, student_id) VALUES
('c1000000-0000-0000-0000-000000000001', 'Mr. Joseph Asante', '0241000001', '0201000001', 'jasante@email.com', 'Father', 'b1000000-0000-0000-0000-000000000001'),
('c1000000-0000-0000-0000-000000000002', 'Mrs. Grace Mensah', '0241000002', NULL, 'gmensah@email.com', 'Mother', 'b1000000-0000-0000-0000-000000000002'),
('c1000000-0000-0000-0000-000000000003', 'Mr. Emmanuel Boateng', '0241000003', '0271000003', NULL, 'Father', 'b1000000-0000-0000-0000-000000000003'),
('c1000000-0000-0000-0000-000000000004', 'Mrs. Comfort Osei', '0241000004', NULL, 'cosei@email.com', 'Mother', 'b1000000-0000-0000-0000-000000000004'),
('c1000000-0000-0000-0000-000000000005', 'Mr. Francis Darko', '0241000005', NULL, NULL, 'Father', 'b1000000-0000-0000-0000-000000000005'),
('c1000000-0000-0000-0000-000000000006', 'Mrs. Beatrice Adjei', '0241000006', '0551000006', 'badjei@email.com', 'Mother', 'b1000000-0000-0000-0000-000000000006'),
('c1000000-0000-0000-0000-000000000007', 'Mr. Daniel Ampah', '0241000007', NULL, NULL, 'Father', 'b1000000-0000-0000-0000-000000000007'),
('c1000000-0000-0000-0000-000000000008', 'Mrs. Helena Frimpong', '0241000008', NULL, 'hfrimpong@email.com', 'Mother', 'b1000000-0000-0000-0000-000000000008');

-- Insert student PINs (default PIN: 1234)
INSERT INTO student_pins (student_id, pin_hash, must_change) VALUES
('b1000000-0000-0000-0000-000000000001', crypt('1234', gen_salt('bf')), true),
('b1000000-0000-0000-0000-000000000002', crypt('1234', gen_salt('bf')), true),
('b1000000-0000-0000-0000-000000000003', crypt('1234', gen_salt('bf')), true);

-- Insert demo contacts
INSERT INTO contacts (name, phone, segment, tag, location) VALUES
('PTA Chairman', '0241500001', 'pta', 'executive', 'Accra'),
('Alumni President', '0241500002', 'alumni', 'executive', 'Kumasi'),
('District Education Officer', '0241500003', 'official', 'GES', 'Accra'),
('School Board Chair', '0241500004', 'board', 'governance', 'Tema'),
('Local MP Office', '0241500005', 'official', 'government', 'Accra');

-- Insert SMS templates
INSERT INTO sms_templates (name, body) VALUES
('Fee Reminder', 'Dear Parent, this is a reminder that school fees of GHS {amount} for {student_name} is due by {due_date}. Thank you.'),
('Exam Schedule', 'Dear Parent, {student_name} exams begin on {date}. Please ensure they are well prepared. Thank you.'),
('Meeting Notice', 'Dear Parent, you are invited to a PTA meeting on {date} at {time} in the school hall. Your attendance is important.'),
('Absence Alert', 'Dear Parent, {student_name} was absent from school today {date}. Please contact the school for more info.'),
('General Announcement', 'Dear Parent/Guardian, {message}. Thank you for your continued support.');

-- Insert wallet
INSERT INTO sms_wallet (balance, currency) VALUES (500.00, 'GHS');

-- Insert wallet transactions
INSERT INTO wallet_transactions (type, amount, balance_before, balance_after, description, reference) VALUES
('credit', 500.00, 0, 500.00, 'Initial top-up', 'TXN-DEMO-001'),
('debit', 15.00, 500.00, 485.00, 'Campaign: Welcome Message', 'TXN-DEMO-002'),
('credit', 200.00, 485.00, 685.00, 'Top-up via Mobile Money', 'TXN-DEMO-003'),
('debit', 25.00, 685.00, 660.00, 'Campaign: Fee Reminder Batch', 'TXN-DEMO-004');

-- Insert campaigns
INSERT INTO campaigns (name, type, status, message_body, target_type, target_value, total_recipients, delivered, failed, cost) VALUES
('Welcome Message 2025', 'sms', 'sent', 'Welcome to the new academic year 2025/2026! We look forward to a productive year.', 'all', NULL, 10, 9, 1, 15.00),
('Fee Reminder - Term 1', 'sms', 'sent', 'Dear Parent, Term 1 fees are due by 15th Feb 2025. Please pay promptly.', 'class', 'Form 1A', 5, 5, 0, 7.50),
('Exam Timetable Notice', 'sms', 'draft', 'Mid-term exams start on Monday 10th March. Collect timetable from the office.', 'all', NULL, 0, 0, 0, 0);

-- Insert messages
INSERT INTO messages (recipient_phone, recipient_name, body, status, cost) VALUES
('0241000001', 'Mr. Joseph Asante', 'Welcome to the new academic year 2025/2026!', 'delivered', 1.50),
('0241000002', 'Mrs. Grace Mensah', 'Welcome to the new academic year 2025/2026!', 'delivered', 1.50),
('0241000003', 'Mr. Emmanuel Boateng', 'Welcome to the new academic year 2025/2026!', 'delivered', 1.50),
('0241000004', 'Mrs. Comfort Osei', 'Term 1 fees are due by 15th Feb 2025.', 'delivered', 1.50),
('0241000005', 'Mr. Francis Darko', 'Term 1 fees are due by 15th Feb 2025.', 'failed', 0),
('0241000006', 'Mrs. Beatrice Adjei', 'Welcome to the new academic year 2025/2026!', 'delivered', 1.50);

-- Insert SMS inbox
INSERT INTO sms_inbox (sender_phone, sender_name, body, is_read, replied) VALUES
('0241000001', 'Mr. Joseph Asante', 'Please confirm my son Kwame is registered for science.', true, false),
('0241000003', 'Mr. Emmanuel Boateng', 'What is the fee amount for Form 1?', false, false),
('0241000006', 'Mrs. Beatrice Adjei', 'Thank you for the update. God bless.', true, false);

-- Insert voice broadcasts
INSERT INTO voice_broadcasts (title, status, target_type, total_recipients, completed, failed) VALUES
('Emergency School Closure', 'sent', 'all', 10, 8, 2),
('PTA Meeting Reminder', 'draft', 'all', 0, 0, 0);

-- Insert reminders
INSERT INTO reminders (title, type, message_body, target_type, frequency, scheduled_at, status) VALUES
('Term 1 Fee Reminder', 'fees', 'Dear Parent, Term 1 fees payment deadline is approaching.', 'all', 'once', now() + interval '7 days', 'active'),
('Weekly Attendance Report', 'attendance', 'Weekly attendance summary for your ward.', 'all', 'weekly', now() + interval '1 day', 'active');

-- Insert student tags
INSERT INTO student_tags (student_id, tag) VALUES
('b1000000-0000-0000-0000-000000000001', 'scholarship'),
('b1000000-0000-0000-0000-000000000001', 'prefect'),
('b1000000-0000-0000-0000-000000000002', 'choir'),
('b1000000-0000-0000-0000-000000000005', 'sports'),
('b1000000-0000-0000-0000-000000000007', 'debate-club');

-- Insert audit logs
INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES
('create', 'campaign', NULL, '{"name": "Welcome Message 2025"}'),
('create', 'student', NULL, '{"name": "Kwame Asante", "student_id": "STU-2025-001"}'),
('update', 'sms_wallet', NULL, '{"action": "top_up", "amount": 500}');
