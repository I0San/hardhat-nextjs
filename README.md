# hardhat-nextjs-plugin

Hardhat plugin that generates React hooks for all smart contract functions and events.


## About

This plugin allows a smart contract developer to generate React implementations of all the smart contract functions and events. 

React hooks or the whole NextJS project can then be shared with the dApp developer and jumpstart the development process.

The plugin also generates an optimized ABI files and copies then along with React Hooks.

To be able to use the hooks, the developer needs to enter the contract address into each abi file.


## Installation
1. Install the dependencies:

```bash
npm install @i0san/hardhat-nextjs
```

2. Import the plugin in your `hardhat.config.js`:

```ts
import "@i0san/hardhat-nextjs";
```


## Tasks

This plugin adds the "_nextjs_" task to Hardhat. To see the info about the task options run:

```bash
npx hardhat help nextjs
```

## Usage

To use the task, run the task after the contracts have been compiled and artifacts generated.

```bash
npx hardhat nextjs
```

This will create a new folder "/nextjs-app" with the app and all the hooks and a usage page.

## Configuration

```
Usage: hardhat [GLOBAL OPTIONS] nextjs [--hooks-only <BOOLEAN>] [--skip-contracts <STRING>]

OPTIONS:

  --hooks-only          Generate React Hooks only. (default: false)
  --skip-contracts      Array of contract names to skip. Format: "[\"Contract1", \"Contract2"]". Optional.

nextjs: Generate NextJS app with implemented contract functions and events.
```


## License
[MIT](https://github.com/i0san/hardhat-nextjs/blob/main/LICENSE)


## Author
IoSan - iosan@protonmail.com