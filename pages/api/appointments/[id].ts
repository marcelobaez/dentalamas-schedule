import { withApiAuth, supabaseServerClient } from '@supabase/auth-helpers-nextjs';

export default withApiAuth(async function ProtectedRoute(req, res) {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'PUT':
      const { data, error } = await supabaseServerClient({ req, res })
        .from('appointments')
        .update({ ...req.body })
        .match({ id });

      if (error) res.status(500).json({ message: 'Hubo un error al actualizar el turno' });

      res.json(data);
      break;
    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
