import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

/** JWT payload дээр шаардагдах талбаруудыг НЭГДСЭН байдлаар тодорхойлно */
export type AuthPayload = JwtPayload & {
  sub: string; // user id (шаардлагатай)
  email: string; // шаардлагатай
  name: string; // шаардлагатай
  role?: string;
  id?: string;
};

/** Express Request-ийг глобалаар өргөтгөж, user талбар нэмнэ */
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthPayload;
  }
}

/** Auth middleware — RequestHandler (void | Promise<void>) байх ёстой */
export const requireAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const header = req.header("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token" });
    return;
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT secret not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;

    // Заавал байх ёстой талбар шалгана
    if (!payload.sub || !payload.email || !payload.name) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
