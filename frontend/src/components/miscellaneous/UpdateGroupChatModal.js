import { ViewIcon, EditIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
  Flex,
  Text,
  Avatar,
  Badge,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure as useAlertDisclosure,
  HStack,
  VStack,
  Stack
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isAlertOpen, 
    onOpen: onAlertOpen, 
    onClose: onAlertClose 
  } = useAlertDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  const { selectedChat, setSelectedChat, user } = ChatState();

  useEffect(() => {
    if (selectedChat && isOpen) {
      setGroupChatName(selectedChat.chatName);
    }
  }, [selectedChat, isOpen]);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query.trim()) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data.filter(u => !selectedChat.users.some(chatUser => chatUser._id === u._id)));
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load search results.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName.trim() || groupChatName === selectedChat.chatName) return;

    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `/api/chat/rename`,
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast({
        title: "Group Name Updated!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Could not rename group.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        { chatId: selectedChat._id, userId: userToAdd._id },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setSearchResult(prev => prev.filter(u => u._id !== userToAdd._id));
      toast({
        title: "User Added!",
        description: `${userToAdd.name} has been added to the group.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Could not add user.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveUser = (userToRemove) => {
    setUserToRemove(userToRemove);
    onAlertOpen();
  };

  const handleRemove = async () => {
    if (!userToRemove) return;
    
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (userToRemove._id === user._id && selectedChat.groupAdmin._id === user._id) {
        const newAdmin = selectedChat.users.find(u => u._id !== user._id);
        
        if (!newAdmin) {
          toast({
            title: "Cannot leave group",
            description: "You must add another member before leaving as admin.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }

        await axios.put(
          `/api/chat/groupadmin`,
          { chatId: selectedChat._id, userId: newAdmin._id },
          config
        );
        
        await axios.put(
          `/api/chat/groupremove`,
          { chatId: selectedChat._id, userId: user._id },
          config
        );
        
        setSelectedChat(null);
      } else {
        const { data } = await axios.put(
          `/api/chat/groupremove`,
          { chatId: selectedChat._id, userId: userToRemove._id },
          config
        );

        if (userToRemove._id === user._id) {
          setSelectedChat(null);
        } else {
          setSelectedChat(data);
        }
      }
      
      setFetchAgain(!fetchAgain);
      fetchMessages();
      
      toast({
        title: userToRemove._id === user._id ? "You left the group" : "User removed",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onAlertClose();
      onClose();
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Could not remove user.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setUserToRemove(null);
    }
  };

  const handleTransferAdmin = async (newAdmin) => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `/api/chat/groupadmin`,
        { chatId: selectedChat._id, userId: newAdmin._id },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast({
        title: "Admin Transferred!",
        description: `${newAdmin.name} is now the group admin.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response?.data?.message || "Could not transfer admin.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tooltip 
        label="Group Info" 
        hasArrow 
        placement="bottom-end"
        bg="teal.600"
        color="white"
        fontSize="xs"
      >
        <IconButton 
          icon={<ViewIcon />} 
          onClick={onOpen}
          variant="ghost"
          colorScheme="teal"
          aria-label="Group Info"
          size="sm"
          ml={2}
          _hover={{ bg: "teal.50" }}
        />
      </Tooltip>

      <Modal 
        onClose={onClose} 
        isOpen={isOpen} 
        isCentered 
        size="lg"
        motionPreset="slideInBottom"
      >
        <ModalOverlay 
          backdropFilter="blur(5px)" 
          bg="blackAlpha.300" 
        />
        <ModalContent 
          borderRadius="lg" 
          boxShadow="xl"
          overflow="hidden"
        >
          <ModalHeader 
            fontSize="xl" 
            fontWeight="bold"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgGradient="linear(to-r, teal.500, blue.500)"
            color="white"
            borderTopRadius="lg"
            py={4}
            px={6}
            borderBottom="1px"
            borderBottomColor="teal.600"
          >
            <Flex align="center">
              <Avatar 
                size="md" 
                name={selectedChat.chatName} 
                mr={4}
                bgGradient="linear(to-r, teal.400, blue.400)"
                color="white"
                fontWeight="bold"
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="semibold">
                  {selectedChat.chatName}
                </Text>
                <Text fontSize="xs" color="teal.100">
                  {selectedChat.users.length} members
                </Text>
              </VStack>
            </Flex>
            <ModalCloseButton 
              position="relative" 
              color="white" 
              _hover={{ bg: "teal.600" }}
              _focus={{ boxShadow: "none" }}
            />
          </ModalHeader>
          
          <ModalBody p={6}>
            <Box mb={6}>
              <Text 
                fontWeight="semibold" 
                mb={3} 
                color="teal.700"
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Group Members
              </Text>
              
              <Flex 
                flexWrap="wrap" 
                gap={3} 
                p={3} 
                borderRadius="md" 
                bg="teal.50"
                maxH="160px"
                overflowY="auto"
                border="1px"
                borderColor="teal.100"
              >
                {selectedChat.users.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    admin={selectedChat.groupAdmin}
                    handleFunction={() => confirmRemoveUser(u)}
                    bg="white"
                    colorScheme="teal"
                    nameColor="teal.800"
                    nameFontWeight="medium"
                    closeColor="red.500"
                    closeHoverColor="red.600"
                    adminColor="blue.500"
                    borderColor="teal.200"
                    hoverBorderColor="teal.300"
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    boxShadow="sm"
                    _hover={{
                      bg: "teal.100",
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                  />
                ))}
              </Flex>
            </Box>

            <Divider 
              my={5} 
              borderColor="teal.200" 
              borderBottomWidth="1px"
            />

            <Box mb={6}>
              <Text 
                fontWeight="semibold" 
                mb={4} 
                color="teal.700"
                fontSize="sm"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                Group Settings
              </Text>
              
              <Stack direction={['column', 'row']} spacing={3} mb={5}>
                <Input
                  placeholder="New Group Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  flex="1"
                  bg="white"
                  borderColor="teal.300"
                  _hover={{ borderColor: "teal.400" }}
                  _focus={{
                    borderColor: "teal.500",
                    boxShadow: "0 0 0 1px rgba(56, 178, 172, 0.6)"
                  }}
                  fontSize="sm"
                />
                <Button 
                  colorScheme="teal" 
                  isLoading={renameloading} 
                  onClick={handleRename}
                  leftIcon={<EditIcon fontSize="xs" />}
                  isDisabled={!groupChatName.trim() || groupChatName === selectedChat.chatName}
                  size="sm"
                  px={4}
                  fontWeight="medium"
                  _hover={{ transform: "translateY(-1px)", bg: "teal.600" }}
                  _active={{ transform: "none", bg: "teal.700" }}
                >
                  Rename
                </Button>
              </Stack>

              {selectedChat.groupAdmin._id === user._id && (
                <FormControl>
                  <Stack direction={['column', 'row']} spacing={3}>
                    <Input 
                      placeholder="Search users to add..." 
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      flex="1"
                      bg="white"
                      borderColor="teal.300"
                      _hover={{ borderColor: "teal.400" }}
                      _focus={{
                        borderColor: "teal.500",
                        boxShadow: "0 0 0 1px rgba(56, 178, 172, 0.6)"
                      }}
                      fontSize="sm"
                    />
                    <Button 
                      colorScheme="teal" 
                      variant="outline"
                      onClick={() => setSearch("")}
                      isDisabled={!search}
                      size="sm"
                      px={4}
                      fontWeight="medium"
                      borderColor="teal.300"
                      _hover={{ 
                        bg: "teal.50",
                        borderColor: "teal.400"
                      }}
                    >
                      Clear
                    </Button>
                  </Stack>
                </FormControl>
              )}
            </Box>

            {loading ? (
              <Flex justify="center" my={4}>
                <Spinner 
                  size="lg" 
                  color="teal.500" 
                  thickness="3px"
                  emptyColor="gray.200"
                />
              </Flex>
            ) : (
              searchResult.length > 0 && (
                <Box 
                  mt={4} 
                  border="1px" 
                  borderColor="teal.200" 
                  borderRadius="md" 
                  p={2}
                  maxH="200px"
                  overflowY="auto"
                  bg="white"
                  boxShadow="sm"
                >
                  <Text 
                    fontSize="xs" 
                    color="teal.600" 
                    mb={2} 
                    fontWeight="medium"
                    px={2}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    Search Results
                  </Text>
                  {searchResult.map((user) => (
                    <UserListItem 
                      key={user._id} 
                      user={user} 
                      handleFunction={() => handleAddUser(user)}
                      actionIcon={<AddIcon color="teal.500" />}
                      bgColor="white"
                      hoverColor="teal.50"
                      nameColor="teal.800"
                      nameFontWeight="medium"
                      emailColor="teal.600"
                      px={3}
                      py={2}
                      borderRadius="md"
                    />
                  ))}
                </Box>
              )
            )}
          </ModalBody>

          <ModalFooter 
            bg="teal.50" 
            borderBottomRadius="lg"
            justifyContent="space-between"
            px={6}
            py={4}
            borderTop="1px"
            borderTopColor="teal.100"
          >
            <Button 
              onClick={() => confirmRemoveUser(user)} 
              colorScheme="red" 
              variant="outline"
              leftIcon={<CloseIcon fontSize="xs" />}
              size="sm"
              px={4}
              fontWeight="medium"
              borderColor="red.300"
              _hover={{ 
                bg: "red.50",
                borderColor: "red.400"
              }}
            >
              Leave Group
            </Button>
            
            {selectedChat.groupAdmin._id === user._id && (
              <Menu>
                <MenuButton 
                  as={Button} 
                  colorScheme="teal" 
                  leftIcon={<EditIcon fontSize="xs" />}
                  size="sm"
                  px={4}
                  fontWeight="medium"
                  _hover={{ transform: "translateY(-1px)", bg: "teal.600" }}
                  _active={{ transform: "none", bg: "teal.700" }}
                >
                  Admin Actions
                </MenuButton>
                <MenuList 
                  minW="200px" 
                  py={1}
                  borderColor="teal.200"
                  boxShadow="md"
                >
                  <MenuItem 
                    icon={<AddIcon color="teal.500" fontSize="sm" />}
                    onClick={() => document.querySelector('input[placeholder="Search users to add..."]').focus()}
                    fontSize="sm"
                    _hover={{ bg: "teal.50" }}
                    _focus={{ bg: "teal.50" }}
                    px={4}
                    py={2}
                  >
                    Add Members
                  </MenuItem>
                  <MenuItem 
                    icon={<EditIcon color="blue.500" fontSize="sm" />}
                    onClick={() => {
                      const nonAdminUsers = selectedChat.users.filter(u => u._id !== user._id);
                      if (nonAdminUsers.length === 0) {
                        toast({
                          title: "No other users to transfer admin to",
                          description: "You must add someone before transferring admin rights.",
                          status: "warning",
                          duration: 3000,
                          isClosable: true,
                        });
                        return;
                      }
                      handleTransferAdmin(nonAdminUsers[0]);
                    }}
                    fontSize="sm"
                    _hover={{ bg: "blue.50" }}
                    _focus={{ bg: "blue.50" }}
                    px={4}
                    py={2}
                  >
                    Transfer Admin
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent 
            borderRadius="lg"
            border="1px"
            borderColor="teal.200"
            boxShadow="xl"
          >
            <AlertDialogHeader 
              fontSize="lg" 
              fontWeight="bold"
              bg="teal.50"
              borderTopRadius="lg"
              px={6}
              py={4}
              borderBottom="1px"
              borderBottomColor="teal.200"
            >
              {userToRemove?._id === user._id ? "Leave Group" : "Remove User"}
            </AlertDialogHeader>

            <AlertDialogBody px={6} py={4}>
              {userToRemove?._id === user._id ? (
                selectedChat.groupAdmin._id === user._id ? (
                  "You are the admin. Leaving will transfer admin rights to another member and then remove you. Continue?"
                ) : (
                  "Are you sure you want to leave this group?"
                )
              ) : (
                `Are you sure you want to remove ${userToRemove?.name} from the group?`
              )}
            </AlertDialogBody>

            <AlertDialogFooter px={6} py={4} bg="teal.50" borderBottomRadius="lg">
              <Button 
                ref={cancelRef} 
                onClick={onAlertClose} 
                size="sm"
                variant="outline"
                borderColor="teal.300"
                _hover={{ bg: "teal.100" }}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleRemove} 
                ml={3}
                isLoading={loading}
                size="sm"
                _hover={{ transform: "translateY(-1px)", bg: "red.600" }}
                _active={{ transform: "none", bg: "red.700" }}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default UpdateGroupChatModal;