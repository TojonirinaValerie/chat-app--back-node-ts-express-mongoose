import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const PrivateKey = process.env.PRIVATE_KEY || "";

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (
  password: string,
  encrypted: string
): boolean => {
  return bcrypt.compareSync(password, encrypted);
};

export const createToken = (data: any, expire: number) => {
  return jwt.sign({...data}, PrivateKey, {expiresIn: expire})
};

export const generateToken = (data: any) => {
  const accessToken = createToken(data, 15 * 60);
  const refreshToken = createToken(data, 24 * 60 * 60);

  return { accessToken, refreshToken };
};

export const verifyValidityToken = (
  token: string,
  callback: jwt.VerifyCallback
) => {
  jwt.verify(token, PrivateKey, callback);
};
