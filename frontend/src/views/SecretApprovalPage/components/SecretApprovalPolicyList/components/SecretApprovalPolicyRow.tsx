import { useState } from "react";
import { faCheckCircle, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ProjectPermissionCan } from "@app/components/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  IconButton,
  Input,
  Td,
  Tr
} from "@app/components/v2";
import { ProjectPermissionActions, ProjectPermissionSub, useProjectPermission } from "@app/context";
import { useUpdateSecretApprovalPolicy } from "@app/hooks/api";
import { TSecretApprovalPolicy } from "@app/hooks/api/types";
import { TWorkspaceUser } from "@app/hooks/api/users/types";

type Props = {
  policy: TSecretApprovalPolicy;
  members?: TWorkspaceUser[];
  workspaceId: string;
  onEdit: () => void;
  onDelete: () => void;
};

export const SecretApprovalPolicyRow = ({
  policy,
  members = [],
  workspaceId,
  onEdit,
  onDelete
}: Props) => {
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const { mutate: updateSecretApprovalPolicy, isLoading } = useUpdateSecretApprovalPolicy();
  const { permission } = useProjectPermission();

  return (
    <Tr>
      <Td>{policy.name}</Td>
      <Td>{policy.environment.slug}</Td>
      <Td>{policy.secretPath || "*"}</Td>
      <Td>
        <DropdownMenu
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              updateSecretApprovalPolicy(
                {
                  workspaceId,
                  id: policy.id,
                  approverUserIds: selectedApprovers
                },
                {
                  onSettled: () => {
                    setSelectedApprovers([]);
                  }
                }
              );
            } else {
              setSelectedApprovers(policy.userApprovers.map(({ userId }) => userId));
            }
          }}
        >
          <DropdownMenuTrigger
            asChild
            disabled={
              isLoading ||
              permission.cannot(ProjectPermissionActions.Edit, ProjectPermissionSub.SecretApproval)
            }
          >
            <Input
              isReadOnly
              value={
                policy?.userApprovers.length ? `${policy.userApprovers.length} selected` : "None"
              }
              className="text-left"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
            align="start"
          >
            <DropdownMenuLabel>
              Select members that are allowed to approve changes
            </DropdownMenuLabel>
            {members?.map(({ user }) => {
              const isChecked = selectedApprovers.includes(user.id);
              return (
                <DropdownMenuItem
                  onClick={(evt) => {
                    evt.preventDefault();
                    setSelectedApprovers((state) =>
                      isChecked ? state.filter((el) => el !== user.id) : [...state, user.id]
                    );
                  }}
                  key={`create-policy-members-${user.id}`}
                  iconPos="right"
                  icon={isChecked && <FontAwesomeIcon icon={faCheckCircle} />}
                >
                  {user.username}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </Td>
      <Td>{policy.approvals}</Td>
      <Td>
        <div className="flex items-center justify-end space-x-4">
          <ProjectPermissionCan
            I={ProjectPermissionActions.Edit}
            a={ProjectPermissionSub.SecretApproval}
            renderTooltip
            allowedLabel="Edit"
          >
            {(isAllowed) => (
              <IconButton variant="plain" ariaLabel="edit" onClick={onEdit} isDisabled={!isAllowed}>
                <FontAwesomeIcon icon={faPencil} size="lg" />
              </IconButton>
            )}
          </ProjectPermissionCan>
          <ProjectPermissionCan
            I={ProjectPermissionActions.Delete}
            a={ProjectPermissionSub.SecretApproval}
            renderTooltip
            allowedLabel="Delete"
          >
            {(isAllowed) => (
              <IconButton
                variant="plain"
                colorSchema="danger"
                size="lg"
                ariaLabel="edit"
                onClick={onDelete}
                isDisabled={!isAllowed}
              >
                <FontAwesomeIcon icon={faTrash} />
              </IconButton>
            )}
          </ProjectPermissionCan>
        </div>
      </Td>
    </Tr>
  );
};
