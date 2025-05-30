/*
  # Add dummy partner firms data

  1. Changes
    - Insert sample partner firms with realistic data
    - Each firm has complete details including contact info and experience
*/

INSERT INTO partner_firms (
  name,
  description,
  logo_url,
  contact_email,
  contact_phone,
  address,
  registration_number,
  years_experience
) VALUES 
(
  'Legacy Trust Executors',
  'A leading executor firm with decades of experience in estate administration and wealth preservation.',
  'https://placehold.co/400x400?text=LTE',
  'contact@legacytrust.com',
  '+27 11 234 5678',
  '123 Trust Avenue, Sandton, Johannesburg, 2196',
  'REG2005/123456/07',
  25
),
(
  'Guardian Estate Services',
  'Specializing in comprehensive estate management with a focus on personalized service and attention to detail.',
  'https://placehold.co/400x400?text=GES',
  'info@guardianestates.co.za',
  '+27 21 987 6543',
  '45 Heritage Road, Cape Town City Centre, 8001',
  'REG2008/765432/07',
  18
),
(
  'Fidelity Estate Managers',
  'Trusted estate administration experts providing professional executor services with integrity and efficiency.',
  'https://placehold.co/400x400?text=FEM',
  'executors@fidelityestates.com',
  '+27 31 345 6789',
  '789 Trust House, Umhlanga, Durban, 4319',
  'REG2010/234567/07',
  15
),
(
  'Prestige Executor Services',
  'Premium estate administration services with a track record of excellence and client satisfaction.',
  'https://placehold.co/400x400?text=PES',
  'service@prestigeexecutors.co.za',
  '+27 12 876 5432',
  '567 Legacy Building, Brooklyn, Pretoria, 0181',
  'REG2012/345678/07',
  12
),
(
  'Capital Estate Trustees',
  'Modern estate management solutions combining traditional expertise with innovative approaches.',
  'https://placehold.co/400x400?text=CET',
  'trustees@capitalestates.com',
  '+27 41 234 5678',
  '321 Wealth Street, Central, Port Elizabeth, 6001',
  'REG2015/456789/07',
  10
);