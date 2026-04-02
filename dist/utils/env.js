import 'dotenv/config';
export function getEnvVar(key) {
    const Var = process.env[key];
    if (!Var) {
        throw new Error(`Environment variable is not set for ${key}`);
    }
    return Var;
}
//# sourceMappingURL=env.js.map