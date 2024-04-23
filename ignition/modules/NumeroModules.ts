import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NumeroModule = buildModule("Numero", (m) => {
  let uris: string[] = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const urisParameter = m.getParameter("uris", uris);
  const numero = m.contract("Numero", [urisParameter]);
  return { numero };
});

export default NumeroModule;
