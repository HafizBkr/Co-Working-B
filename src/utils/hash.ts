import bcryptjs from "bcryptjs";

/**
 * Hashes a plain text password using bcrypt
 * @param password - The plain text password to hash
 * @param rounds - Number of salt rounds (defaults to 10)
 * @returns The hashed password
 */
export const hashPassword = async (
  password: string,
  rounds: number = 10,
): Promise<string> => {
  const salt = await bcryptjs.genSalt(rounds);
  return bcryptjs.hash(password, salt);
};

/**
 * Compares a plain text password with a hashed password
 * @param plainPassword - The plain text password to check
 * @param hashedPassword - The hashed password to compare against
 * @returns Boolean indicating if the passwords match
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};
