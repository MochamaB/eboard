import React from 'react';
import { Typography, Divider } from 'antd';
import { ParticipantSelector, type SelectedParticipant } from '../../../components/common';

const { Title, Text } = Typography;

interface ParticipantsStepProps {
  boardId?: string;
  participants: SelectedParticipant[];
  setParticipants: (value: SelectedParticipant[]) => void;
  quorumPercentage: number;
  setQuorumPercentage: (value: number) => void;
}

const ParticipantsStep: React.FC<ParticipantsStepProps> = ({
  boardId,
  participants,
  setParticipants,
  quorumPercentage,
  setQuorumPercentage,
}) => {
  return (
    <div>
      <Title level={5} style={{ marginBottom: 4 }}>Participants</Title>
      <Text type="secondary">
        Select meeting participants and configure quorum requirements.
      </Text>
      <Divider />
      <ParticipantSelector
        boardId={boardId}
        value={participants}
        onChange={setParticipants}
        showQuorumSettings={true}
        quorumPercentage={quorumPercentage}
        onQuorumChange={setQuorumPercentage}
        allowGuests={true}
        defaultSelected="board_members"
        maxHeight={350}
      />
    </div>
  );
};

export default ParticipantsStep;
