import { withApiAuth, supabaseServerClient, getUser } from '@supabase/auth-helpers-nextjs';

export default withApiAuth(async function ProtectedRoute(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      const { user } = await getUser({ req, res });

      const body = {
        ...req.body,
        user_id: user.id,
      };

      const { data, error } = await supabaseServerClient({ req, res })
        .from('appointments')
        .insert([body]);

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ message: 'Ya existe un turno con estos datos' });
        } else {
          res.status(500).json({ message: 'Hubo un error al crear el paciente' });
        }
      }

      res.json(data);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
