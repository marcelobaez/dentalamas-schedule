import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiHandler } from 'next';

const ProtectedRoute: NextApiHandler = async (req, res) => {
  const {
    query: { id, name },
    method,
  } = req;

  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient({ req, res });
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
    case 'POST':
      const { user } = session;

      const body = {
        ...req.body,
        created_by: user.id,
      };

      const { data, error } = await supabase.from('patients').insert([body]);

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ message: 'Ya existe un paciente con estos datos' });
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
};

export default ProtectedRoute;
