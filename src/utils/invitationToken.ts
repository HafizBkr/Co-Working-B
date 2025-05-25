import jwt from 'jsonwebtoken';
import { config } from '../configs/configs';
import { v4 as uuidv4 } from 'uuid';

export const generateInvitationToken = (
  email: string,
  workspaceId: string,
  expiresIn = '7d'
): string => {
  return jwt.sign(
    {
      email,
      workspaceId,
      type: 'workspace_invitation',
      jti: uuidv4()
    },
    config.jwtSecret,
    { expiresIn }
  );
};

export const verifyInvitationToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
