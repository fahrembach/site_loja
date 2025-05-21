import path from "path";
import { execSync } from "child_process";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", ".");

function pergunta(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      "Deseja realizar a varredura da pauta para detectar atualizações?\nDigite 1 para SIM, 2 para NÃO: ",
      (resposta) => {
        rl.close();
        resolve(resposta.trim());
      }
    );
  });
}

async function main() {
  // Loop para garantir resposta válida (1 ou 2)
  let resposta = "";
  while (resposta !== "1" && resposta !== "2") {
    resposta = await pergunta();
  }
  process.chdir(rootDir);
  if (resposta === "1") {
    console.log("Iniciando varredura e atualização dos produtos...");
    try {
      execSync("bun scripts/update-pauta-produtos.ts", { stdio: "inherit" });
    } catch (error) {
      console.error("Erro ao rodar varredura:", error);
      process.exit(1);
    }
  } else {
    console.log("Pulando varredura.");
  }
  console.log("Iniciando aplicação normalmente...");
  try {
    execSync("bun run dev", { stdio: "inherit" });
  } catch (error) {
    console.error("Erro ao iniciar o site:", error);
    process.exit(1);
  }
}

main();
