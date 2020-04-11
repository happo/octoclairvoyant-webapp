import React from 'react';
import { Stack, useToast } from '@chakra-ui/core';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { GitHubRepositoryData, RepositoryReleases } from 'types';
import RepositoryUrlInput from 'components/RepositoryUrlInput';
import ReleaseVersionSelect from 'components/ReleaseVersionSelect';
import useWindowWidth from 'hooks/useWindowWidth';

const INLINE_BREAKPOINT = 768; // desktop

export const RELEASES_QUERY = gql`
  query Repository($name: String!, $owner: String!) {
    repository(name: $name, owner: $owner) {
      name
      url
      releases(orderBy: { field: CREATED_AT, direction: ASC }, first: 100) {
        pageInfo {
          hasNextPage
        }
        nodes {
          description
          id
          name
        }
      }
    }
  }
`;

type PropTypes = {
  onChange(repository: RepositoryReleases | null): void;
};

const RepositoryReleasesPicker: React.FC<PropTypes> = ({ onChange }) => {
  const [
    repositoryData,
    setRepositoryData,
  ] = React.useState<GitHubRepositoryData | null>(null);

  const windowWidth = useWindowWidth();

  const toast = useToast();

  const { loading, error, data } = useQuery<
    { repository: RepositoryReleases },
    GitHubRepositoryData | null
  >(RELEASES_QUERY, { variables: repositoryData, skip: !repositoryData });

  React.useEffect(() => {
    if (data) {
      const { releases, ...repository } = data.repository;
      onChange(repository);
    } else {
      onChange(null);
    }
  }, [data, onChange]);

  React.useEffect(() => {
    if (error) {
      toast({
        title: 'An error occurred.',
        description: 'Unable to retrieve repository releases',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleRepositoryChange = (newRepoData: GitHubRepositoryData | null) => {
    setRepositoryData(newRepoData);
  };

  // show stack inline only on desktop
  const isInlineStack = windowWidth >= INLINE_BREAKPOINT;

  console.log('window width updated');

  return (
    <Stack spacing={4} isInline={isInlineStack}>
      <RepositoryUrlInput
        isLoading={loading}
        onRepositoryChange={handleRepositoryChange}
      />
      <ReleaseVersionSelect
        label="From release"
        id="from-release"
        width={{ base: 'full', md: '50%' }}
      >
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </ReleaseVersionSelect>
      <ReleaseVersionSelect
        label="To release"
        id="to-release"
        width={{ base: 'full', md: '50%' }}
      >
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </ReleaseVersionSelect>
    </Stack>
  );
};

export default RepositoryReleasesPicker;
