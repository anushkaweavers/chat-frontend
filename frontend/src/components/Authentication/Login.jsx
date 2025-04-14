import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Box,
  Heading,
  Text,
  Flex,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaSignInAlt, FaUserSecret } from "react-icons/fa";
import { useToast } from "@chakra-ui/toast";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  const { setUser } = ChatState();

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("teal.600", "teal.300");

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        w="100%"
        maxW="md"
        p={6}
        borderRadius="lg"
        boxShadow="xl"
        bg={cardBg}
      >
        <Flex direction="column" align="center" mb={4}>
          <Heading as="h2" size="lg" color={headingColor}>
            Welcome Back
          </Heading>
          <Text color={textColor} fontSize="sm" mt={1}>
            Sign in to continue
          </Text>
        </Flex>

        <VStack spacing={4}>
          <FormControl id="email" isRequired>
            <FormLabel fontSize="sm">Email Address</FormLabel>
            <Input
              value={email}
              type="email"
              placeholder="your.email@example.com"
              onChange={(e) => setEmail(e.target.value)}
              focusBorderColor="teal.500"
              size="sm"
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel fontSize="sm">Password</FormLabel>
            <InputGroup>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="Enter password"
                focusBorderColor="teal.500"
                size="sm"
              />
              <InputRightElement h="full">
                <Button
                  size="xs"
                  onClick={handleClick}
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                >
                  <Icon as={show ? FaEyeSlash : FaEye} color="gray.500" />
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            colorScheme="teal"
            width="full"
            mt={2}
            onClick={submitHandler}
            isLoading={loading}
            loadingText="Signing In..."
            size="sm"
            leftIcon={<Icon as={FaSignInAlt} />}
          >
            Login
          </Button>

          <Button
            variant="outline"
            colorScheme="teal"
            width="full"
            size="sm"
            onClick={() => {
              setEmail("guest@example.com");
              setPassword("123456");
            }}
            leftIcon={<Icon as={FaUserSecret} />}
          >
            Use Guest Credentials
          </Button>
        </VStack>

        <Flex mt={4} justifyContent="center">
          <Text color={textColor} fontSize="sm">
            New user?{" "}
            <Button
              variant="link"
              color="teal.500"
              size="sm"
              onClick={() => history.push("/signup")}
            >
              Sign up
            </Button>
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default Login;