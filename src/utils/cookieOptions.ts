import { convertMs } from './convertMs';

export function createCookieOptions(tokenLife: string = '7d') {
  return {
    expires: new Date(Date.now() + (convertMs(tokenLife) as number)),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };
}
