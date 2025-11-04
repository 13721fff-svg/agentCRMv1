/*
  # Add Complete Demo Data
  
  Tasks, Meetings, and Campaigns with correct JSONB for target_audience
*/

DO $$
DECLARE
  demo_org_id UUID := '550e8400-e29b-41d4-a716-446655440010';
  demo_user_id UUID;
  client1_id UUID := '750e8400-e29b-41d4-a716-446655440001';
  client2_id UUID := '750e8400-e29b-41d4-a716-446655440002';
  client3_id UUID := '750e8400-e29b-41d4-a716-446655440003';
BEGIN
  SELECT id INTO demo_user_id FROM users LIMIT 1;
  
  IF demo_user_id IS NOT NULL THEN
    -- Tasks
    INSERT INTO tasks (id, org_id, title, description, status, priority, due_date, assigned_to, created_by, created_at) VALUES
      ('950e8400-e29b-41d4-a716-446655440001', demo_org_id, 'Follow up client call', 'Call renovation feedback', 'pending', 'high', NOW() + INTERVAL '1 day', demo_user_id, demo_user_id, NOW() - INTERVAL '2 days'),
      ('950e8400-e29b-41d4-a716-446655440002', demo_org_id, 'Prepare quote', 'Send cleaning quote', 'in_progress', 'high', NOW() + INTERVAL '2 days', demo_user_id, demo_user_id, NOW() - INTERVAL '1 day'),
      ('950e8400-e29b-41d4-a716-446655440003', demo_org_id, 'Update portfolio', 'Add work examples', 'pending', 'medium', NOW() + INTERVAL '3 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440004', demo_org_id, 'Order materials', 'Buy supplies', 'pending', 'high', NOW() + INTERVAL '1 day', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440005', demo_org_id, 'Team meeting', 'Strategy discussion', 'completed', 'medium', NOW() - INTERVAL '1 day', demo_user_id, demo_user_id, NOW() - INTERVAL '3 days'),
      ('950e8400-e29b-41d4-a716-446655440006', demo_org_id, 'Review feedback', 'Analyze reviews', 'in_progress', 'low', NOW() + INTERVAL '5 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440007', demo_org_id, 'Send invoice', 'Client invoice', 'pending', 'high', NOW() + INTERVAL '1 day', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440008', demo_org_id, 'Update prices', 'Review pricing', 'pending', 'medium', NOW() + INTERVAL '7 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440009', demo_org_id, 'Prepare equipment', 'Check gear', 'completed', 'high', NOW() - INTERVAL '2 days', demo_user_id, demo_user_id, NOW() - INTERVAL '4 days'),
      ('950e8400-e29b-41d4-a716-446655440010', demo_org_id, 'Call lead', 'Follow up inquiry', 'pending', 'medium', NOW() + INTERVAL '4 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440011', demo_org_id, 'Order supplies', 'Restock', 'in_progress', 'medium', NOW() + INTERVAL '3 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440012', demo_org_id, 'Social media', 'Post work', 'pending', 'low', NOW() + INTERVAL '2 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440013', demo_org_id, 'Vehicle service', 'Maintenance', 'pending', 'medium', NOW() + INTERVAL '10 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440014', demo_org_id, 'Monthly report', 'Compile metrics', 'in_progress', 'high', NOW() + INTERVAL '5 days', demo_user_id, demo_user_id, NOW()),
      ('950e8400-e29b-41d4-a716-446655440015', demo_org_id, 'Thank you call', 'Follow up', 'completed', 'low', NOW() - INTERVAL '3 days', demo_user_id, demo_user_id, NOW() - INTERVAL '5 days')
    ON CONFLICT (id) DO NOTHING;

    -- Meetings
    INSERT INTO meetings (id, org_id, title, description, start_time, end_time, location, client_id, created_by, created_at) VALUES
      ('a50e8400-e29b-41d4-a716-446655440001', demo_org_id, 'Kitchen consultation', 'Discuss details', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'Client location', client1_id, demo_user_id, NOW() - INTERVAL '1 day'),
      ('a50e8400-e29b-41d4-a716-446655440002', demo_org_id, 'Quote presentation', 'Present proposal', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'Office', client2_id, demo_user_id, NOW()),
      ('a50e8400-e29b-41d4-a716-446655440003', demo_org_id, 'Photo planning', 'Plan shoot', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1.5 hours', 'Studio', client3_id, demo_user_id, NOW()),
      ('a50e8400-e29b-41d4-a716-446655440004', demo_org_id, 'Project review', 'Review work', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '45 minutes', 'Client site', client1_id, demo_user_id, NOW() - INTERVAL '3 days'),
      ('a50e8400-e29b-41d4-a716-446655440005', demo_org_id, 'Budget talk', 'Discuss budget', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '1 hour', 'Video call', client3_id, demo_user_id, NOW()),
      ('a50e8400-e29b-41d4-a716-446655440006', demo_org_id, 'Site inspection', 'Inspect site', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '2 hours', 'Kyiv', client2_id, demo_user_id, NOW()),
      ('a50e8400-e29b-41d4-a716-446655440007', demo_org_id, 'Contract signing', 'Sign agreement', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week' + INTERVAL '30 minutes', 'Office', client1_id, demo_user_id, NOW() - INTERVAL '8 days'),
      ('a50e8400-e29b-41d4-a716-446655440008', demo_org_id, 'Follow-up', 'Address questions', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '45 minutes', 'Phone', client2_id, demo_user_id, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Campaigns with JSONB target_audience
    INSERT INTO campaigns (id, org_id, title, description, type, status, target_audience, start_date, end_date, created_by, created_at) VALUES
      ('b50e8400-e29b-41d4-a716-446655440001', demo_org_id, 'Spring Sale', 'Renovation discount', 'email', 'active', '{"segments": ["past_clients"], "count": 120}'::jsonb, NOW() - INTERVAL '1 week', NOW() + INTERVAL '2 weeks', demo_user_id, NOW() - INTERVAL '2 weeks'),
      ('b50e8400-e29b-41d4-a716-446655440002', demo_org_id, 'New Service Launch', 'Photo services', 'push', 'active', '{"segments": ["all_users"], "count": 350}'::jsonb, NOW() - INTERVAL '3 days', NOW() + INTERVAL '1 month', demo_user_id, NOW() - INTERVAL '1 week'),
      ('b50e8400-e29b-41d4-a716-446655440003', demo_org_id, 'Holiday Special', 'Year end packages', 'banner', 'scheduled', '{"segments": ["residential"], "count": 200}'::jsonb, NOW() + INTERVAL '1 month', NOW() + INTERVAL '2 months', demo_user_id, NOW()),
      ('b50e8400-e29b-41d4-a716-446655440004', demo_org_id, 'Referral Program', 'Refer and save', 'email', 'completed', '{"segments": ["active_clients"], "count": 85}'::jsonb, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 month', demo_user_id, NOW() - INTERVAL '3 months'),
      ('b50e8400-e29b-41d4-a716-446655440005', demo_org_id, 'Summer Maintenance', 'AC campaign', 'push', 'draft', '{"segments": ["ac_clients"], "count": 150}'::jsonb, NOW() + INTERVAL '2 months', NOW() + INTERVAL '3 months', demo_user_id, NOW() - INTERVAL '1 week')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
