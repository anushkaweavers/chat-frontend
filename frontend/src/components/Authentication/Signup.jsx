import { useState } from "react";
import { useHistory } from "react-router";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
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
  Avatar,
  Flex,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaCloudUploadAlt, FaUserPlus } from "react-icons/fa";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const history = useHistory();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("teal.600", "teal.300");

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );
      
      toast({
        title: "Registration Successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (!pics) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "anushka_2");
      data.append("cloud_name", "dqwb01qwt");
      
      fetch("https://api.cloudinary.com/v1_1/dqwb01qwt/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
          toast({
            title: "Image Upload Failed",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        });
    } else {
      toast({
        title: "Unsupported File Format",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
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
          <Avatar
            size="md"
            src={pic}
            icon={<Icon as={FaUserPlus} fontSize="xl" />}
            mb={2}
            bg="teal.500"
            color="white"
          />
          <Heading as="h2" size="lg" color={headingColor}>
            Create Account
          </Heading>
          <Text color={textColor} fontSize="sm" mt={1}>
            Join our community
          </Text>
        </Flex>

        <VStack spacing={4}>
          <FormControl id="name" isRequired>
            <FormLabel fontSize="sm">Full Name</FormLabel>
            <Input
              placeholder="Your full name"
              onChange={(e) => setName(e.target.value)}
              focusBorderColor="teal.500"
              size="sm"
            />
          </FormControl>

          <FormControl id="email" isRequired>
            <FormLabel fontSize="sm">Email Address</FormLabel>
            <Input
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
                type={show ? "text" : "password"}
                placeholder="Create password"
                onChange={(e) => setPassword(e.target.value)}
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

          <FormControl id="confirm-password" isRequired>
            <FormLabel fontSize="sm">Confirm Password</FormLabel>
            <InputGroup>
              <Input
                type={show ? "text" : "password"}
                placeholder="Confirm password"
                onChange={(e) => setConfirmpassword(e.target.value)}
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

          <FormControl id="pic">
            <FormLabel fontSize="sm">Profile Picture</FormLabel>
            <InputGroup>
              <Input
                type="file"
                p={1}
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
                hidden
                id="file-upload"
              />
              <Button
                as="label"
                htmlFor="file-upload"
                leftIcon={<Icon as={FaCloudUploadAlt} />}
                w="full"
                variant="outline"
                colorScheme="teal"
                cursor="pointer"
                size="sm"
              >
                {pic ? "Change Image" : "Upload Image"}
              </Button>
            </InputGroup>
          </FormControl>

          <Button
            colorScheme="teal"
            width="full"
            mt={2}
            onClick={submitHandler}
            isLoading={picLoading}
            loadingText="Creating Account..."
            size="sm"
            leftIcon={<Icon as={FaUserPlus} />}
          >
            Sign Up
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default Signup;