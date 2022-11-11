import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import { Alert } from '@/ui/Alert';
import Button from '@/ui/v2/Button';
import Input from '@/ui/v2/Input';
import Text from '@/ui/v2/Text';
import { discordAnnounce } from '@/utils/discordAnnounce';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { nhost } from '@/utils/nhost';
import { triggerToast } from '@/utils/toast';
import {
  refetchGetWorkspaceMembersQuery,
  useGetWorkspaceMembersQuery,
  useInsertWorkspaceMemberInviteMutation,
} from '@/utils/__generated__/graphql';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import validator from 'validator';
import WorkspaceMember from './WorkspaceMember';
import WorkspaceMemberInvite from './WorkspaceMemberInvite';

function WorkspaceMemberInviteForm({
  workspaceMembers,
  setWorkspaceInviteError,
  isOwner,
}: any) {
  const [email, setEmail] = useState('');

  const { currentWorkspace } = useCurrentWorkspaceAndApplication();

  const [insertWorkspaceMemberInvite] = useInsertWorkspaceMemberInviteMutation({
    refetchQueries: [
      refetchGetWorkspaceMembersQuery({
        workspaceId: currentWorkspace.id,
      }),
    ],
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWorkspaceInviteError();

    // Check if email is not already part of workspaceMembers.
    // I think it's fine to do this client side only for now.
    if (workspaceMembers.some((member) => member.user.email === email)) {
      setWorkspaceInviteError('User is already member of workspace.');
      return;
    }

    if (!validator.isEmail(email)) {
      setWorkspaceInviteError('Not a valid email address');

      return;
    }

    try {
      await insertWorkspaceMemberInvite({
        variables: {
          workspaceMemberInvite: {
            workspaceId: currentWorkspace.id,
            email,
            memberType: 'member',
          },
        },
      });
      triggerToast(
        `Invite to join workspace ${currentWorkspace.name} sent to ${email}.`,
      );
    } catch (error) {
      await discordAnnounce(
        `Error trying to invite to ${email} to ${currentWorkspace.name} ${error.message}`,
      );
      if (
        error.message ===
        'Foreign key violation. insert or update on table "workspace_member_invites" violates foreign key constraint "workspace_member_invites_email_fkey"'
      ) {
        setWorkspaceInviteError(
          'You can only invite users that are already registered at Nhost. Ask the person to register an account, then invite them again.',
        );

        return;
      }

      setWorkspaceInviteError(getErrorMessage(error, 'invite'));

      return;
    }

    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-flow-col gap-2">
      <Input
        placeholder="Send invite over email (e.g. name@mycompany.com)"
        className="col-span-10"
        type="email"
        value={email}
        disabled={!isOwner}
        fullWidth
        hideEmptyHelperText
        onChange={(event) => {
          setWorkspaceInviteError('');
          setEmail(event.target.value);
        }}
      />

      <Button
        type="submit"
        variant="outlined"
        color="secondary"
        disabled={!email || !isOwner}
        className="w-38 justify-self-stretch"
      >
        Send Invite
      </Button>
    </form>
  );
}

export default function WorkspaceMembers() {
  const [workspaceInviteError, setWorkspaceInviteError] = useState('');
  const { currentWorkspace } = useCurrentWorkspaceAndApplication();

  const { data, loading } = useGetWorkspaceMembersQuery({
    variables: {
      workspaceId: currentWorkspace.id,
    },
    fetchPolicy: 'cache-first',
  });

  const user = nhost.auth.getUser();
  const isOwner = data?.workspace?.workspaceMembers.some(
    (member) => member.user.id === user!.id && member.type === 'owner',
  );

  return (
    <div className="max-w-3xl mx-auto mt-18 font-display">
      <div className="grid grid-flow-row gap-1 mb-2">
        <Text variant="h3">Members</Text>
        <Text>
          People in this workspace can manage all projects listed above.
        </Text>
      </div>

      <WorkspaceMemberInviteForm
        workspaceMembers={data?.workspace?.workspaceMembers}
        setWorkspaceInviteError={setWorkspaceInviteError}
        isOwner={isOwner}
      />

      {workspaceInviteError && (
        <Alert severity="error" className="my-2">
          {workspaceInviteError}
        </Alert>
      )}

      {!loading && !isOwner && (
        <Alert severity="error" className="my-2">
          Only owners can invite new members to the workspace
        </Alert>
      )}

      {loading ?? <Skeleton height={60} count={3} />}

      {data?.workspace?.workspaceMembers.map((workspaceMember) => (
        <WorkspaceMember
          key={workspaceMember.id}
          workspaceMember={workspaceMember}
          isOwner={isOwner}
        />
      ))}

      {data?.workspace?.workspaceMemberInvites.map((workspaceMemberInvite) => (
        <WorkspaceMemberInvite
          key={workspaceMemberInvite.id}
          workspaceMemberInvite={workspaceMemberInvite}
          isOwner={isOwner}
        />
      ))}
    </div>
  );
}
