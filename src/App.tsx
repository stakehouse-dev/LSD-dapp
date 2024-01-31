import './App.css'

import { ApolloProvider } from '@apollo/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { configureChains, createClient, goerli, mainnet, WagmiConfig } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { SafeConnector } from 'wagmi/connectors/safe'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import { FeesMev, NodeOperator, ProtectedStaking } from '@/components/app/Manage'
import GraphqlPlayground from '@/components/GraphqlPlayground'
import { LayoutDashboard } from '@/components/layouts'
import { rpcUrls, supportedChains } from '@/constants/chains'
import BlockswapSDKProvider from '@/context/BlockswapSDKContext'
import GraphqlProvider from '@/context/GraphqlContext'
import { RewardsProvider } from '@/context/RewardsContext'
import StakingStoreProvider from '@/context/StakingStoreContext'
import UserProvider from '@/context/UserContext'
import GraphqlClient from '@/graphql/client'
import {
  Activity,
  Deposit,
  Facilitator,
  FeeCompliant,
  Manage,
  RageQuit,
  Redeem,
  WalletConnect,
  Withdraw,
  Withdrawal,
  WithdrawalStatus
} from '@/views'

import { FacilitatorRageQuit } from './views/Facilitator/RageQuit'
import RunNode from './views/RunNode'
import Utilities from './views/Utilities'

if (!window.Buffer) {
  window.Buffer = Buffer
}

const { chains: goerliChains, provider: goerliProvider } = configureChains(
  [goerli],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: (rpcUrls as any)[chain.id] }
      }
    })
  ]
)

const { chains: mainnetChains, provider: mainnetProvider } = configureChains(
  [mainnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        return { http: (rpcUrls as any)[chain.id] }
      }
    })
  ]
)

const chains = process.env.REACT_APP_NETWORK_ID === `${goerli.id}` ? goerliChains : mainnetChains
const provider =
  process.env.REACT_APP_NETWORK_ID === `${goerli.id}` ? goerliProvider : mainnetProvider

const client = createClient({
  autoConnect: false,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        showQrModal: true,
        projectId: `${process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID}`
      }
    }),
    new SafeConnector({
      chains: supportedChains
    })
  ],
  provider: provider as any
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  return (
    <Router>
      <WagmiConfig client={client}>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={GraphqlClient}>
            <BlockswapSDKProvider>
              <UserProvider>
                <StakingStoreProvider>
                  <GraphqlProvider>
                    <RewardsProvider>
                      <Routes>
                        <Route path="/" element={<LayoutDashboard />}>
                          <Route path="sign-in" element={<WalletConnect />} />
                          <Route index element={<Deposit />} />
                          <Route path="run-a-node" element={<RunNode />} />
                          <Route path="utilities" element={<Utilities />} />
                          <Route path="ragequit/:blsKey" element={<RageQuit />} />
                          <Route path="withdrawal/:blsKey" element={<Withdrawal />} />
                          <Route path="withdrawal/:blsKey/status" element={<WithdrawalStatus />} />
                          <Route path="manage" element={<Manage />} />
                          <Route path="manage/activity" element={<Activity />} />
                          <Route path="manage/withdraw" element={<Withdraw />} />
                          <Route path="manage/:activeTab/:activeMode" element={<Manage />} />
                          <Route path="manage/protected-staking" element={<ProtectedStaking />} />
                          <Route path="manage/fees-mev" element={<FeesMev />} />
                          <Route path="facilitator/ragequit" element={<FacilitatorRageQuit />} />
                          <Route path="manage/node-operator" element={<NodeOperator />} />
                          <Route path="manage/fee-compliant-list" element={<FeeCompliant />} />
                          <Route path="manage/redeem" element={<Redeem />} />
                          <Route path="manage/facilitator" element={<Facilitator />} />
                          <Route path=":mode" element={<Deposit />} />
                        </Route>
                        <Route
                          path="/graphql-playground/:mode/:account"
                          element={<GraphqlPlayground />}
                        />
                      </Routes>
                    </RewardsProvider>
                  </GraphqlProvider>
                </StakingStoreProvider>
              </UserProvider>
            </BlockswapSDKProvider>
          </ApolloProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </WagmiConfig>
    </Router>
  )
}

export default App
