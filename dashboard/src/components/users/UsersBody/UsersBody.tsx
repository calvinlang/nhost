import { useDialog } from '@/components/common/DialogProvider';
import Chip from '@/components/ui/v2/Chip';
import TrashIcon from '@/components/ui/v2/icons/TrashIcon';
import UserIcon from '@/components/ui/v2/icons/UserIcon';
import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import type { Role } from '@/types/application';
import ActivityIndicator from '@/ui/v2/ActivityIndicator';
import Divider from '@/ui/v2/Divider';
import { Dropdown } from '@/ui/v2/Dropdown';
import IconButton from '@/ui/v2/IconButton';
import DotsVerticalIcon from '@/ui/v2/icons/DotsVerticalIcon';
import List from '@/ui/v2/List';
import { ListItem } from '@/ui/v2/ListItem';
import Text from '@/ui/v2/Text';
import { useRemoteAppGetUsersQuery } from '@/utils/__generated__/graphql';
import { UserAddIcon } from '@heroicons/react/solid';
import { Avatar } from '@mui/material';
import { format, formatRelative } from 'date-fns';
import { Fragment, useState } from 'react';

export interface RoleSettingsFormValues {
  /**
   * Default role.
   */
  authUserDefaultRole: string;
  /**
   * Allowed roles for the project.
   */
  authUserDefaultAllowedRoles: Role[];
}

export default function UsersBody() {
  const { currentApplication } = useCurrentWorkspaceAndApplication();
  const { openDrawer, openAlertDialog } = useDialog();
  const [searchQuery] = useState('');
  const [currentPage] = useState(1);

  const limit = 20;

  const offset = currentPage - 1;

  const { data, error, loading } = useRemoteAppGetUsersQuery({
    variables: {
      where: {
        _or: [
          {
            displayName: {
              _like: `%${searchQuery}%`,
            },
          },
          {
            email: {
              _like: `%${searchQuery}%`,
            },
          },
        ],
      },
      limit,
      offset: offset * limit,
    },
    skip:
      !currentApplication?.subdomain &&
      !currentApplication?.hasuraGraphqlAdminSecret,
  });

  if (loading) {
    return <ActivityIndicator delay={1000} label="Loading users..." />;
  }

  if (error) {
    throw error;
  }

  function handleViewUser(user: any) {
    openDrawer('EDIT_USER', {
      title: 'User Details',
      payload: { user },
    });
  }

  function handleDeleteUser() {
    openAlertDialog({
      title: 'Delete Role',
      payload: <Text>Are you sure you want to delete the &quot; undone.</Text>,
    });
  }

  return (
    <div className="grid grid-flow-row gap-2">
      <div className="grid grid-cols-4 gap-2 py-3 border-gray-200 lg:grid-cols-4 border-b-1">
        <Text className="font-medium">Name</Text>
        <Text className="font-medium">Signed up at</Text>
        <Text className="font-medium">Last Seen</Text>
        <Text className="font-medium">Sign In Methods</Text>
      </div>
      <div className="grid grid-flow-row gap-2">
        <List>
          {data.users.map((user) => (
            <Fragment key={user.id}>
              <ListItem.Root
                className="grid grid-cols-4 gap-2 py-2.5 items-center"
                secondaryAction={
                  <Dropdown.Root>
                    <Dropdown.Trigger
                      asChild
                      hideChevron
                      className="absolute -translate-y-1/2 right-1 top-1/2"
                    >
                      <IconButton variant="borderless" color="secondary">
                        <DotsVerticalIcon />
                      </IconButton>
                    </Dropdown.Trigger>

                    <Dropdown.Content
                      menu
                      PaperProps={{ className: 'w-32' }}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <Dropdown.Item
                        onClick={() => handleViewUser(user)}
                        className="grid grid-flow-col items-center gap-2 p-2 text-sm+ font-medium"
                      >
                        <UserIcon className="w-4 h-4" />
                        <Text className="font-medium">View User</Text>
                      </Dropdown.Item>

                      <Divider component="li" />

                      <Dropdown.Item
                        className="grid grid-flow-col items-center gap-2 p-2 text-sm+ font-medium text-red"
                        onClick={handleDeleteUser}
                      >
                        <TrashIcon className="w-4 h-4" />
                        <Text className="font-medium text-red">Delete</Text>
                      </Dropdown.Item>

                      <Divider component="li" />
                    </Dropdown.Content>
                  </Dropdown.Root>
                }
              >
                <ListItem.Text>
                  <div className="grid grid-flow-col gap-3 place-content-start">
                    <Avatar className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-300 rounded-full">
                      <span className="text-xs font-medium text-gray-600 uppercase">
                        {user.displayName.slice(0, 2)}
                      </span>
                    </Avatar>
                    <div className="grid items-center grid-flow-row">
                      <Text className="text-sm+ font-medium">
                        {user.displayName}
                      </Text>
                      <Text className="font-normal text-greyscaleGreyDark">
                        {user.email}
                      </Text>
                    </div>
                  </div>
                </ListItem.Text>
                <ListItem.Text>
                  <Text
                    color="greyscaleDark"
                    className="font-normal"
                    size="normal"
                  >
                    {format(new Date(user.createdAt), 'd MMM yyyy')}
                  </Text>
                </ListItem.Text>
                <ListItem.Text>
                  {formatRelative(new Date(), new Date(user.createdAt))}
                </ListItem.Text>
                <ListItem.Text>
                  <Chip
                    component="span"
                    color="default"
                    size="small"
                    label="Email & Password"
                    icon={<UserAddIcon className="w-4 h-4" />}
                  />
                </ListItem.Text>
              </ListItem.Root>

              <Divider component="li" />
            </Fragment>
          ))}
        </List>
      </div>
    </div>
  );
}