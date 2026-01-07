import bcrypt from "bcrypt";
import { password } from "bun";
import { hash } from "crypto";

const SALT_ROUNDS = 5;
export const hashPassword = async (plainPassword : string ) => {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
}

export const comparePassword = async (plain : string, hash : string) => {
    return bcrypt.compare(plain, hash)
}