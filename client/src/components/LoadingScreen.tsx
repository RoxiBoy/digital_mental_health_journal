import { Box, Spinner, VStack, Heading, Text } from "@chakra-ui/react"

export default function LoadingScreen() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="linear-gradient(135deg, #f0f4f8 0%, #e8f0f7 100%)"
    >
      <VStack spacing={4}>
        <Heading color="#2d5a7b" size="lg">
          MindFlow
        </Heading>
        <Spinner size="lg" color="#4a9bbe" />
        <Text color="#666" fontSize="sm">
          Loading your wellness journey...
        </Text>
      </VStack>
    </Box>
  )
}
