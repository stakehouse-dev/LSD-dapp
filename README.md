# LSD Dapp

![](./dapp.png)

## Overview

LSD Dapp allows you to interact with the Liquid Staking Derivative Network Protocol smart contracts built on top of the Stakehouse protocol.

For more information, please take a look at the docs: https://docs.joinstakehouse.com/lsd/overview

## Software is provided as is

Please feel free to customize and host as best suits. This Dapp can easily serve as a whitelabelling site and method to attract ETH stake to a specific Stakehouse rather than supporting every LSD network. There is a lot of freedom.

## Netlify Supported

Any hosting site should work but this dapp has been working on Netlify. If there are any issues hosting on other services, please open a PR by following the contribution guide below.

## Getting Started

### `npm i`

Installs the dependencies.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Contributing

We welcome contributions to LSD Dapp. If you'd like to contribute, please follow these guidelines:

1. Fork the project.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear and concise messages.
4. Push your changes to your fork.
5. Create a pull request to the main repository.

## Limit deposits to your LSD network

If you wish to deploy and use the Dapp and allow node operators to register only with your selected LSD networks, please follow these guidelines:

1. Fork the project.
2. Open `src/components/app/Deposit/NodeOperator.tsx`
3. Replace `networkList` on line 56 with your list of selected LSD network id and ticker as follows:
```js
const networkList = [{
    id: <YOUR_NETWORK_ID>,
    ticker: <YOUR_TICKER>
}]
```

## License

This project is licensed under MIT - see the [LICENSE.md](./LICENSE.md) file for details.
