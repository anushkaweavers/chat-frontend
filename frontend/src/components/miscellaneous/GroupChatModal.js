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
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Avatar,
  Text,
  Spinner,
  Stack,
  Wrap,
  WrapItem,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../userAvatar/UserListItem";
import { AddIcon } from "@chakra-ui/icons"; 
const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const searchInputRef = useRef(null);

  const { user, chats, setChats } = ChatState();

  // Clear search when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSearchResult([]);
    }
  }, [isOpen]);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some(user => user._id === userToAdd._id)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
    setSearch(""); // Clear search input
    setSearchResult([]); // Clear search results
    if (searchInputRef.current) {
      searchInputRef.current.focus(); // Refocus on search input
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query.trim()) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      // Filter out already selected users and current user
      const filteredData = data.filter(
        u => !selectedUsers.some(su => su._id === u._id) && u._id !== user._id
      );
      setSearchResult(filteredData);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName.trim()) {
      toast({
        title: "Please enter a group name",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (selectedUsers.length < 2) {
      toast({
        title: "Group must have at least 2 members",
        description: "Please add more users to create a group",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setCreating(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      // Include current user in the group
      const allUsers = [...selectedUsers.map((u) => u._id), user._id];
      
      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(allUsers),
        },
        config
      );
      
      setChats([data, ...chats]);
      onClose();
      toast({
        title: "Group created successfully!",
        description: `"${groupChatName}" is ready for chatting`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      toast({
        title: "Failed to create group",
        description: error.response?.data?.message || "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Box onClick={onOpen}>{children}</Box>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg" 
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader
            fontSize="2xl"
            fontWeight="bold"
            textAlign="center"
            bg="teal.500"
            color="white"
            borderTopRadius="xl"
            py={4}
          >
            Create New Group
          </ModalHeader>
          <ModalCloseButton color="white" />
          
          <ModalBody pb={6}>
            <Stack spacing={4}>
              <FormControl>
                <Input
                  placeholder="Group name (e.g., Family, Work Team, Friends)"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  size="lg"
                  focusBorderColor="teal.500"
                />
              </FormControl>

              <FormControl>
                <Input
                  ref={searchInputRef}
                  placeholder="Search users to add..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  size="lg"
                  focusBorderColor="teal.500"
                />
              </FormControl>

              {/* Selected users */}
              {selectedUsers.length > 0 && (
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    Selected members ({selectedUsers.length}):
                  </Text>
                  <Wrap spacing={2}>
                    {selectedUsers.map((user) => (
                      <WrapItem key={user._id}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="teal"
                        >
                          <Avatar
                            src={user.pic}
                            size="xs"
                            name={user.name}
                            ml={-1}
                            mr={2}
                          />
                          <TagLabel>{user.name}</TagLabel>
                          <TagCloseButton onClick={() => handleDelete(user)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}

              {/* Search results */}
              <Box 
                maxH="300px" 
                overflowY="auto" 
                borderWidth={searchResult.length > 0 ? "1px" : 0}
                borderRadius="md"
                p={searchResult.length > 0 ? 2 : 0}
              >
                {loading ? (
                  <Flex justify="center" py={4}>
                    <Spinner size="lg" color="teal.500" />
                  </Flex>
                ) : searchResult.length > 0 ? (
                  <>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Search results:
                    </Text>
                    <Stack spacing={2}>
                      {searchResult.map((user) => (
                        <UserListItem
                          key={user._id}
                          user={user}
                          handleFunction={() => handleGroup(user)}
                          actionIcon={<AddIcon color="green.500" />}
                        />
                      ))}
                    </Stack>
                  </>
                ) : search ? (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No users found
                  </Text>
                ) : null}
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px">
            <Button 
              variant="outline" 
              mr={3} 
              onClick={() => {
                onClose();
                setGroupChatName("");
                setSelectedUsers([]);
                setSearch("");
                setSearchResult([]);
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              isLoading={creating}
              loadingText="Creating..."
              isDisabled={!groupChatName.trim() || selectedUsers.length < 2}
            >
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;