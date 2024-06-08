import { NextApiHandler } from 'next';
import createClient from '../../../utils/supabase/api';

const ProtectedRoute: NextApiHandler = async (req, res) => {
  const {
    query: { id },
    method,
  } = req;

  // Create authenticated Supabase Client
  const supabase = createClient(req, res);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return res.status(401).json({
      error: 'not_authenticated',
      description: 'The user does not have an active session or is not authenticated',
    });

  switch (method) {
    case 'DELETE':
      const { data: deletedData, error: deletedError } = await supabase
        .from('appointments')
        .delete()
        .match({ id });

      if (deletedError)
        res.status(500).json({ message: 'Hubo un error intentando eliminar el registro' });

      res.json(deletedData);
    case 'PUT':
      const { data: updatedData, error: updatedError } = await supabase
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
};

export default ProtectedRoute;
