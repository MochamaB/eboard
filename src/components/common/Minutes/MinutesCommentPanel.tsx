/**
 * Minutes Comment Panel
 * Display and manage comments on minutes with threading and resolution
 */

import React, { useState } from 'react';
import { Card, Space, Typography, Button, Input, Avatar, Tag, Divider, Empty, Tooltip } from 'antd';
import {
  UserOutlined,
  CommentOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useBoardContext } from '../../../contexts';
import type { MinutesComment } from '../../../types/minutes.types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface MinutesCommentPanelProps {
  minutesId: string;
  comments: MinutesComment[];
  allowComments: boolean;
  onAddComment: (payload: {
    comment: string;
    commentType: 'general' | 'section' | 'highlight';
    sectionReference?: string;
    highlightedText?: string;
    textPosition?: { start: number; end: number };
    parentCommentId?: string;
  }) => void;
  onResolveComment: (commentId: string, response: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId: number;
  isSecretary?: boolean;
}

export const MinutesCommentPanel: React.FC<MinutesCommentPanelProps> = ({
  minutesId,
  comments,
  allowComments,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  currentUserId,
  isSecretary = false,
}) => {
  const { theme } = useBoardContext();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [resolvingComment, setResolvingComment] = useState<string | null>(null);
  const [resolutionResponse, setResolutionResponse] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    onAddComment({
      comment: newComment,
      commentType: 'general',
    });
    setNewComment('');
  };

  const handleReply = (parentId: string) => {
    if (!replyText.trim()) return;

    onAddComment({
      comment: replyText,
      commentType: 'general',
      parentCommentId: parentId,
    });
    setReplyText('');
    setReplyingTo(null);
  };

  const handleResolve = (commentId: string) => {
    if (!resolutionResponse.trim()) return;

    onResolveComment(commentId, resolutionResponse);
    setResolutionResponse('');
    setResolvingComment(null);
  };

  const getCommentTypeColor = (type: MinutesComment['commentType']) => {
    switch (type) {
      case 'section':
        return theme.infoColor;
      case 'highlight':
        return theme.warningColor;
      default:
        return theme.textSecondary;
    }
  };

  const getCommentTypeLabel = (type: MinutesComment['commentType']) => {
    switch (type) {
      case 'section':
        return 'Section Comment';
      case 'highlight':
        return 'Highlight';
      default:
        return 'General';
    }
  };

  const renderComment = (comment: MinutesComment, isReply: boolean = false) => {
    const isOwnComment = comment.createdBy === currentUserId;
    const canResolve = isSecretary && !comment.resolved;
    const canDelete = isOwnComment || isSecretary;

    return (
      <div
        key={comment.id}
        style={{
          marginLeft: isReply ? '32px' : '0',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: comment.resolved ? theme.successLight : theme.backgroundSecondary,
          borderRadius: '6px',
          border: `1px solid ${comment.resolved ? theme.successColor : theme.borderColor}`,
        }}
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Space size={8}>
              <Avatar size="small" icon={<UserOutlined />} />
              <div>
                <Text strong style={{ fontSize: '13px' }}>{comment.createdByName}</Text>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </Text>
              </div>
            </Space>
            <Space size={4}>
              {comment.commentType !== 'general' && (
                <Tag color={getCommentTypeColor(comment.commentType)} style={{ fontSize: '11px' }}>
                  {getCommentTypeLabel(comment.commentType)}
                </Tag>
              )}
              {comment.resolved && (
                <Tag color={theme.successColor} icon={<CheckCircleOutlined />} style={{ fontSize: '11px' }}>
                  Resolved
                </Tag>
              )}
            </Space>
          </div>

          {comment.sectionReference && (
            <Tag style={{ fontSize: '11px' }}>
              Section: {comment.sectionReference}
            </Tag>
          )}

          {comment.highlightedText && (
            <div style={{ 
              padding: '8px', 
              backgroundColor: theme.warningLight, 
              borderLeft: `3px solid ${theme.warningColor}`,
              borderRadius: '4px',
            }}>
              <Text style={{ fontSize: '12px', fontStyle: 'italic' }}>
                "{comment.highlightedText}"
              </Text>
            </div>
          )}

          <Paragraph style={{ marginBottom: 0, fontSize: '13px' }}>
            {comment.comment}
          </Paragraph>

          {comment.resolved && comment.secretaryResponse && (
            <div style={{ 
              padding: '8px', 
              backgroundColor: theme.backgroundPrimary, 
              borderLeft: `3px solid ${theme.successColor}`,
              borderRadius: '4px',
              marginTop: '8px',
            }}>
              <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Secretary Response:
              </Text>
              <Text style={{ fontSize: '12px' }}>{comment.secretaryResponse}</Text>
              {comment.respondedAt && (
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                  Responded on {new Date(comment.respondedAt).toLocaleString()}
                </Text>
              )}
            </div>
          )}

          {!comment.resolved && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {!isReply && allowComments && (
                <Button
                  type="text"
                  size="small"
                  icon={<CommentOutlined />}
                  onClick={() => setReplyingTo(comment.id)}
                >
                  Reply
                </Button>
              )}
              {canResolve && (
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setResolvingComment(comment.id)}
                >
                  Resolve
                </Button>
              )}
              {canDelete && (
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteComment(comment.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          )}

          {replyingTo === comment.id && (
            <div style={{ marginTop: '8px' }}>
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </Space.Compact>
              <Button
                type="text"
                size="small"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                style={{ marginTop: '4px' }}
              >
                Cancel
              </Button>
            </div>
          )}

          {resolvingComment === comment.id && (
            <div style={{ marginTop: '8px' }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: '12px' }}>Resolve with response:</Text>
                <TextArea
                  value={resolutionResponse}
                  onChange={(e) => setResolutionResponse(e.target.value)}
                  placeholder="Provide a response to this comment..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleResolve(comment.id)}
                    disabled={!resolutionResponse.trim()}
                  >
                    Resolve
                  </Button>
                  <Button
                    onClick={() => {
                      setResolvingComment(null);
                      setResolutionResponse('');
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Space>
            </div>
          )}
        </Space>
      </div>
    );
  };

  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentCommentId === parentId);

  const unresolvedCount = comments.filter(c => !c.resolved).length;

  return (
    <Card
      title={
        <Space>
          <CommentOutlined />
          <span>Comments</span>
          {unresolvedCount > 0 && (
            <Tag color={theme.warningColor}>{unresolvedCount} Unresolved</Tag>
          )}
        </Space>
      }
      size="small"
      styles={{
        body: { padding: '16px' },
      }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {allowComments && (
          <div>
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ marginBottom: '8px' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Add Comment
            </Button>
          </div>
        )}

        {!allowComments && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: theme.warningLight, 
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Comments are disabled for these minutes
            </Text>
          </div>
        )}

        {comments.length > 0 && <Divider style={{ margin: 0 }} />}

        {comments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No comments yet"
            style={{ padding: '20px 0' }}
          />
        ) : (
          <div>
            {topLevelComments.map(comment => (
              <div key={comment.id}>
                {renderComment(comment)}
                {getReplies(comment.id).map(reply => renderComment(reply, true))}
              </div>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
};
