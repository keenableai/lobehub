'use client';

import { Avatar, Flexbox, Text } from '@lobehub/ui';
import { Select, type SelectProps } from '@lobehub/ui/base-ui';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { DEFAULT_AVATAR } from '@/const/meta';
import { messengerService } from '@/services/messenger';

interface AgentSelectProps extends Omit<SelectProps<string>, 'options' | 'value' | 'onChange'> {
  onChange?: (agentId: string | undefined) => void;
  value?: string;
  /** Scope to list agents for: a workspace id, or null/undefined for personal. */
  workspaceId?: string | null;
}

const AgentSelect = memo<AgentSelectProps>(({ value, onChange, workspaceId, ...rest }) => {
  const { t: tCommon } = useTranslation('common');
  // Cascading fetch: agents are scoped to the selected `workspaceId` (or
  // personal when null). The scope is part of the SWR key so switching scope
  // refetches the right list.
  const agentsSWR = useSWR(['messenger:agentsForBinding', workspaceId ?? null], () =>
    messengerService.listAgentsForBinding(workspaceId),
  );

  const defaultAgentTitle = tCommon('defaultSession');
  const options = useMemo(
    () =>
      (agentsSWR.data ?? []).map((agent) => {
        const title = agent.title || defaultAgentTitle;
        return {
          label: (
            <Flexbox horizontal align={'center'} gap={8}>
              <Avatar
                avatar={agent.avatar || DEFAULT_AVATAR}
                background={agent.backgroundColor ?? undefined}
                size={20}
              />
              <Text ellipsis>{title}</Text>
            </Flexbox>
          ),
          title,
          value: agent.id,
        };
      }),
    [agentsSWR.data, defaultAgentTitle],
  );

  return (
    <Select
      showSearch
      options={options}
      value={value ?? null}
      onChange={(next) => onChange?.((next as string | null) ?? undefined)}
      {...rest}
    />
  );
});

AgentSelect.displayName = 'MessengerAgentSelect';

export default AgentSelect;
