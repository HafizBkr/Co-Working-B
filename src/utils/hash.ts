import bcryptjs from "bcryptjs";

export const hashPassword = async (
  password: string,
  rounds: number = 10,
): Promise<string> => {
  const salt = await bcryptjs.genSalt(rounds);
  return bcryptjs.hash(password, salt);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};
