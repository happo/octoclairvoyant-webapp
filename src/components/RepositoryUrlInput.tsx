import React from 'react';
import {
  FormErrorMessage,
  FormControl,
  FormControlProps,
  FormLabel,
  IconButton,
  Input,
  Stack,
} from '@chakra-ui/core';
import { getRepositoryDataFromUrl } from 'utils';
import { GitHubRepositoryData } from 'types';

type CustomProps = {
  isLoading?: boolean;
  onRepositoryChange(repoData: GitHubRepositoryData | null): void;
};

type PropTypes = FormControlProps & CustomProps;

const RepositoryUrlInput: React.FC<PropTypes> = ({
  onRepositoryChange,
  // TODO: add onRepositoryClear callback
  isLoading = false,
  ...rest
}) => {
  const [repoUrl, setRepoUrl] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const handleGetRepositoryData = () => {
    const repoData = getRepositoryDataFromUrl(repoUrl);
    onRepositoryChange(repoData);

    if (repoData) {
      setError('');
      // TODO: when onRepositoryClear available, call onRepositoryChange here
    } else {
      setError('Please fill valid GitHub repository url');
      // TODO: when onRepositoryClear available, call onRepositoryClear here
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setRepoUrl(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGetRepositoryData();
    }
  };

  return (
    <FormControl
      isRequired
      width="full"
      isDisabled={isLoading}
      isInvalid={!!error}
      {...rest}
    >
      <FormLabel htmlFor="repo-url">Repository url</FormLabel>
      <Stack isInline>
        <Input
          type="text"
          id="repo-url"
          placeholder="Paste the repo url and press enter or click search button"
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <IconButton
          aria-label="Search database"
          variantColor="orange"
          icon="search"
          isLoading={isLoading}
          onClick={handleGetRepositoryData}
        />
      </Stack>
      <FormErrorMessage>
        Please fill valid GitHub repository url
      </FormErrorMessage>
    </FormControl>
  );
};

export default RepositoryUrlInput;
