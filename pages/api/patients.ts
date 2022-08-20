import {
  withApiAuth,
  supabaseServerClient,
  getUser
} from '@supabase/auth-helpers-nextjs';

export default withApiAuth(async function ProtectedRoute(req, res) {
  const { user } = await getUser({req, res});

  const body = {
    ...req.body,
    created_by: user.id
  }
  
  const { data, error } = await supabaseServerClient({ req, res })
    .from('patients')
    .insert([body]);

  if (error) console.log('error', error)

  console.log('data', data)

  res.json(data);
});