import {
  withApiAuth,
  supabaseServerClient,
  getUser
} from '@supabase/auth-helpers-nextjs';

export default withApiAuth(async function ProtectedRoute(req, res) {
  const { user } = await getUser({req, res});

  const body = {
    ...req.body,
    user_id: user.id
  }
  
  const { data, error } = await supabaseServerClient({ req, res })
    .from('appointments')
    .insert([body]);

  res.json(data);
});