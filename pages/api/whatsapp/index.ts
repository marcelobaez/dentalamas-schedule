import type { NextApiRequest, NextApiResponse } from 'next';
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // try {
  //   const message = await client.messages.create({
  //     body: 'Probando desde NextAPI',
  //     messagingServiceSid: 'MG483cb950dc3aad8142c2c783dc0741d1',
  //     to: '+543764211883',
  //   });
  //   console.log(message.sid);
  // } catch (error) {
  //   console.log(error)
  // }

  res.status(200).json({ name: 'John Doe' });
};
