import type { BoxProps, LinkProps, ListItemProps } from '@chakra-ui/react'
import {
  Box,
  Code,
  Heading,
  Icon,
  Link,
  List,
  ListItem,
  Tag,
  TagLabel,
  Text,
} from '@chakra-ui/react'
import { HiOutlineExternalLink } from 'react-icons/hi'

import BlockQuote from '~/components/BlockQuote'
import TextSkeleton from '~/components/TextSkeleton'
import useProcessDescriptionMdast from '~/hooks/useProcessDescriptionMdast'
import type { ProcessedRelease, Repository } from '~/models'
import { getReleaseVersion } from '~/utils'

const RemarkH1 = (props: unknown) => (
  <Heading as="h2" size="xl" mb="4" {...props} />
)

const RemarkH2 = (props: unknown) => (
  <Heading as="h3" size="lg" mb="4" {...props} />
)

const RemarkH3 = (props: unknown) => (
  <Heading as="h4" size="md" mb="4" {...props} />
)

const RemarkH4 = (props: unknown) => (
  <Heading as="h5" size="sm" mb="4" {...props} />
)

const RemarkH5 = (props: unknown) => (
  <Heading as="h6" size="xs" mb="2" {...props} />
)
const RemarkH6 = (props: unknown) => (
  <Heading as="h6" size="xs" mb="2" {...props} />
)

const RemarkP = (props: unknown) => <Text mb="2" {...props} />

const RemarkA = ({ href, children, ...rest }: LinkProps) => (
  <Link isExternal href={href} {...rest}>
    {children} <Icon as={HiOutlineExternalLink} mx="2px" />
  </Link>
)

const RemarkUl = (props: unknown) => (
  <List styleType="disc" mb="4" ml="4" stylePosition="outside" {...props} />
)

const RemarkOl = (props: unknown) => (
  <List
    as="ol"
    styleType="decimal"
    mb="4"
    ml="4"
    stylePosition="outside"
    {...props}
  />
)

const RemarkLi = (props: ListItemProps) => <ListItem {...props} />

const RemarkPre = (props: unknown) => (
  <Code
    as="pre"
    display="block"
    bgColor="primaryBg"
    mb="4"
    p="3"
    overflowX="auto"
    {...props}
  />
)

const RemarkCode = (props: unknown) => (
  <Code color="inherit" bgColor="primaryBg" {...props} />
)

const RemarkBlockquote = (props: unknown) => <BlockQuote mb="2" {...props} />

const remarkReactComponents = {
  h1: RemarkH1,
  h2: RemarkH2,
  h3: RemarkH3,
  h4: RemarkH4,
  h5: RemarkH5,
  h6: RemarkH6,
  p: RemarkP,
  a: RemarkA,
  ul: RemarkUl,
  ol: RemarkOl,
  li: RemarkLi,
  pre: RemarkPre,
  code: RemarkCode,
  blockquote: RemarkBlockquote,
}

interface ProcessedReleaseChangeProps extends BoxProps {
  repository: Repository
  processedReleaseChange: ProcessedRelease
}

const ProcessedReleaseChangeDescription = ({
  processedReleaseChange,
  repository,
  ...rest
}: ProcessedReleaseChangeProps) => {
  const { processedDescription, isProcessing } = useProcessDescriptionMdast({
    repository,
    description: processedReleaseChange.descriptionMdast,
    componentsMapping: remarkReactComponents,
  })

  return (
    <Box {...rest} mb={8}>
      {isProcessing ? (
        <TextSkeleton />
      ) : (
        <>
          <Link isExternal href={processedReleaseChange.html_url}>
            <Tag
              color="secondary.900"
              size="lg"
              mb={2}
              rounded="full"
              bgColor="secondary.200"
              _hover={{ bgColor: 'secondary.300' }}
              _active={{ bgColor: 'secondary.200', color: 'secondary.900' }}
            >
              <TagLabel>{getReleaseVersion(processedReleaseChange)}</TagLabel>
            </Tag>
          </Link>
          <Box ml={4}>{processedDescription}</Box>
        </>
      )}
    </Box>
  )
}

export default ProcessedReleaseChangeDescription
