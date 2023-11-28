import EmbeddedExplorer from '@apollo/explorer'
import { buildClientSchema, getIntrospectionQuery, IntrospectionQuery, printSchema } from 'graphql'
import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useSWR from 'swr'

import { WITHDRAW_MODE } from '@/constants'
import documentByMode from '@/constants/document'
import { GraphqlContext } from '@/context/GraphqlContext'

const endpointUrl = 'https://api.thegraph.com/subgraphs/name/bsn-eng/liquid-staking-derivative'
interface Props {
  account: string
  schema: string
  mode: WITHDRAW_MODE
  validatorId?: string
}

function Playground({ account, schema, mode, validatorId }: Props) {
  useEffect(() => {
    new EmbeddedExplorer({
      target: '#embeddedExplorer',
      endpointUrl,
      // @ts-ignore — this field is definitely valid according to their docs, not sure why its not accepted here
      schema,
      initialState: {
        document: documentByMode(mode, account, validatorId),
        displayOptions: {
          showHeadersAndEnvVars: true,
          docsPanelState: 'closed'
        }
      }
    })
  }, [])

  return <div id="embeddedExplorer" style={{ width: '100%', height: '100vh' }} />
}

function parseSchema(introspection: IntrospectionQuery) {
  const schema = buildClientSchema(introspection)
  const sdl = printSchema(schema)
  return sdl
}

const fetcher = (url: string) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({ query: getIntrospectionQuery() })
  }).then((res) => res.json())

const GraphQLPlayground = () => {
  const { data, error } = useSWR(endpointUrl, fetcher)
  const { mode, account } = useParams()

  const { validatorId } = useContext(GraphqlContext)

  if (error) return <div>Error fetching schema</div>
  if (!data || !account || typeof account !== 'string') return <div></div>

  const introspection = data.data as IntrospectionQuery
  const schema = parseSchema(introspection)

  return (
    <Playground
      account={account.toLowerCase()}
      mode={mode as WITHDRAW_MODE}
      validatorId={validatorId}
      schema={schema}
    />
  )
}

export default GraphQLPlayground
