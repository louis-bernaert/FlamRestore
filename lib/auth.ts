import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'unsafe_secret';
const COOKIE_NAME = 'snapflam_session';

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export const createToken = (userId: string) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

export const setSessionCookie = (token: string) => {
  const cookieStore = cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7
  });
};

export const clearSessionCookie = () => {
  const cookieStore = cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: '',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0
  });
};

export const getCurrentUser = async () => {
  const session = cookies().get(COOKIE_NAME)?.value;
  if (!session) return null;

  const data = verifyToken(session);
  if (!data) return null;

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    include: { friends: true }
  });
  return user;
};
