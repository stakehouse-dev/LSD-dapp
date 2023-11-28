import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/justinzal/stakehouse-analytics'
  }),
  cache: new InMemoryCache()
})

export default client
