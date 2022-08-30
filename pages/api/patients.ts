import { withApiAuth, supabaseServerClient, getUser } from '@supabase/auth-helpers-nextjs';

export default withApiAuth(async function ProtectedRoute(req, res) {
  const { user } = await getUser({ req, res });

  const body = {
    ...req.body,
    created_by: user.id,
  };

  const { data, error } = await supabaseServerClient({ req, res }).from('patients').insert([body]);

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ya existe un paciente con estos datos' });
    } else {
      res.status(500).json({ message: 'Hubo un error al crear el paciente' });
    }
  }

  res.json(data);
});
