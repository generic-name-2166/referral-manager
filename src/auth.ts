import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";

// using bcryptjs because bcrypt's dependencies don't play well with esbuild

export function comparePassword(pass: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pass, hash);
}

export function hashPassword(password: string): Promise<string> {
  const rounds = 10;
  return bcrypt.hash(password, rounds);
}

// openssl rand -hex 32
const secret =
  "4a29d888ad4b04b6a627fd650ae1126beecd2b36771e1c1b835b35a318d20300";

export function generateAccessToken(email: string): string {
  return jwt.sign({ sub: email }, secret, { expiresIn: "1h" });
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Response | undefined {
  const authHeader = req.headers.authorization;
  const token: string | undefined = authHeader?.split(" ")[1];

  if (token === undefined) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secret, (err, email) => {
    if (err) {
      console.error(err);
      return res.sendStatus(403);
    } else if (email === undefined || typeof email === "string") {
      console.error(email);
      return res.sendStatus(400);
    }
    res.locals["email"] = email.sub;

    next();
  });
}
