import bcrypt from 'bcrypt';

// Número de rondas de salting
const SALT_ROUNDS = 10;

// Encriptar contraseña
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw error;
  }
};

// Verificar contraseña
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw error;
  }
};

export default {
  hashPassword,
  comparePassword
}; 