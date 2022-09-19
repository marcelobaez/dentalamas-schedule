import { withApiAuth, supabaseServerClient } from '@supabase/auth-helpers-nextjs';

export default withApiAuth(async function ProtectedRoute(req, res) {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'DELETE':
      const { data: deletedData, error: deletedError } = await supabaseServerClient({ req, res })
        .from('appointments')
        .delete()
        .match({ id });

      if (deletedError)
        res.status(500).json({ message: 'Hubo un error intentando eliminar el registro' });

      res.json(deletedData);
    case 'PUT':
      const { data: updatedData, error: updatedError } = await supabaseServerClient({ req, res })
        .from('appointments')
        .update({ ...req.body })
        .match({ id });

      if (updatedError) res.status(500).json({ message: 'Hubo un error al actualizar el turno' });

      res.json(updatedData);
      break;
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
});
