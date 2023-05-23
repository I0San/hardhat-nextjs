import fs from "fs";
import path from "path";
import * as fsextra from "fs-extra";
import { task } from "hardhat/config";
import { Artifacts } from "hardhat/types";
import { createGetter } from "./createGetter";
import { createSetter } from "./createSetter";
import { createEventListener } from "./createEventListener";
import { capitalize } from "./utils";
import { boolean } from "hardhat/internal/core/params/argumentTypes";

let resolvedQualifiedNames: string[];
const sourceNextjsFolder = path.join(__dirname, "../../nextjs-app");
const sourceHooksFolder = path.join(__dirname, "../../nextjs-app/hooks");
const targetRootFolder = path.join(process.cwd(), "/nextjs-app");
const targetHooksFolder = path.join(process.cwd(), "/nextjs-app/hooks");

function shouldSkipContract(
  qualifiedName: string,
  skippable: string[]
): boolean {
  for (const item of skippable) {
    if (qualifiedName.includes(item)) return true;
  }
  return false;
}

function getContracts(artifacts: Artifacts, skippable: string[] = []): any[] {
  const contracts = [];

  for (const qualifiedName of resolvedQualifiedNames) {
    let name: string;
    let artifact = artifacts.readArtifactSync(qualifiedName);

    try {
      artifact = artifacts.readArtifactSync(artifact.contractName);
      name = artifact.contractName;
    } catch (e) {
      name = qualifiedName;
    }

    if (!shouldSkipContract(qualifiedName, skippable)) {
      contracts.push({
        name: name,
        address: "",
        abi: artifact.abi,
      });
    }
  }

  return contracts;
}

function createContractFile(c: any) {
  if (!c.name) return;
  const dir = path.join(sourceNextjsFolder, "/hooks");
  const name = capitalize(c.name);
  const fileName = `contract${name}.js`;
  const content = `
export const address=YOUR_CONTRACT_ADDRESS
export const abi=${JSON.stringify(c.abi)}
  `;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(`${dir}/${fileName}`, content);
}

function createHookFile(contractName: string, f: any) {
  if (!f.name) return;
  const dir = path.join(sourceNextjsFolder, "/hooks");
  const name = capitalize(f.name);
  const fileName = `use${name}.js`;

  let _code = `
import { ethers } from "ethers"
import { useState } from "react"
import address from "./contract${capitalize(contractName)}"
import abi from "./contract${capitalize(contractName)}"

`;

  if (f.type === "function") {
    if (f.stateMutability === "view") {
      _code += createGetter(f);
    } else {
      _code += createSetter(f);
    }
  } else if (f.type === "event") {
    _code += createEventListener(f);
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(`${dir}/${fileName}`, _code);
}

task(
  "nextjs",
  "Generate NextJS app with implemented contract functions and events."
)
  .addOptionalParam("hooksOnly", "Generate React Hooks only.", false, boolean)
  .addOptionalParam(
    "skipContracts",
    "Array of contract names to skip. Optional.",
    undefined
  )
  .setAction(async (args: any, hre) => {
    //clean previous builds...
    fsextra.emptyDirSync(sourceHooksFolder);

    console.log("Generating NextJS application from artifacts...");

    // check & set skippable contracts
    let skippable = [];
    if (args.skipContracts) {
      try {
        skippable = JSON.parse(args.skipContracts);
        console.log("Skipping the following contract names:", skippable);
      } catch (error) {
        console.log(error);
        console.log("Please check your --skip-contracts parameter.");
      }
    }

    resolvedQualifiedNames = await hre.artifacts.getAllFullyQualifiedNames();
    const contracts = getContracts(hre.artifacts, skippable);

    // Generate hooks & abis
    contracts.forEach((c) => {
      createContractFile(c);
      c.abi.forEach((m: any) => {
        createHookFile(c.name, m);
      });
    });

    // Copy results
    if (args.hooksOnly) {
      // hooks only
      fsextra.copySync(sourceHooksFolder, targetHooksFolder, {
        overwrite: true,
        recursive: true,
      });
    } else {
      // nextjs app with hooks
      fsextra.copySync(sourceNextjsFolder, targetRootFolder, {
        overwrite: true,
        recursive: true,
      });
    }

    console.log("Done.");
  });
