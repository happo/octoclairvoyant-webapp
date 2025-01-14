import type { RestEndpointMethodTypes } from '@octokit/rest'
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { octokit } from '~/github-client'

type ReposQueryResponse = RestEndpointMethodTypes['search']['repos']['response']
type ReposQueryResults = ReposQueryResponse['data']
type ReposQueryParams = RestEndpointMethodTypes['search']['repos']['parameters']

function useSearchRepositoriesQuery(
	params: ReposQueryParams,
	config?: UseQueryOptions<ReposQueryResponse, Error, ReposQueryResults>
): UseQueryResult<ReposQueryResults, Error> {
	const finalParams = { per_page: 100, ...params }
	return useQuery<ReposQueryResponse, Error, ReposQueryResults>(
		['repos', finalParams],
		async () => octokit.search.repos(finalParams),
		{
			...config,
			select: (response) => response.data,
		}
	)
}

export { useSearchRepositoriesQuery }
