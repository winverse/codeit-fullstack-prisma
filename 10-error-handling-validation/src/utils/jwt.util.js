import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

export const verifyToken = (token, tokenType = 'access') => {
  try {
    const secret =
      tokenType === 'access'
        ? process.env.JWT_SECRET
        : process.env.JWT_REFRESH_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};
