const { PrismaClient } = require('@prisma/client');
const { UsersRepository } = require('./dist/modules/users/users.repository.js');
const { AuthService } = require('./dist/modules/auth/auth.service.js');

const prisma = new PrismaClient();
const usersRepository = new UsersRepository();
const authService = new AuthService(usersRepository);

async function main() {
  console.log("Intentando hacer login de prueba...");
  try {
    const res = await authService.login({
      email: "xenonestudio@gmail.com",
      password: "wrong-password"
    });
    console.log("Login exitoso:", res);
  } catch (e) {
    console.error("Error capturado en login:");
    console.error(e);
  }
}

main().finally(() => prisma.$disconnect());
