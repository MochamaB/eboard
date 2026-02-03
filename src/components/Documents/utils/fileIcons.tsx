/**
 * File Icon Utilities
 * Centralized file type icon mapping for document components
 */

import React from 'react';
import {
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileOutlined,
  PlayCircleOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { FILE_TYPES, getFileTypeConfig } from '../../../constants/documents';

/**
 * Get the appropriate icon component for a file type
 */
export const getFileIcon = (
  fileType: string,
  size: number = 24
): React.ReactNode => {
  const config = getFileTypeConfig(fileType);
  const iconStyle = { fontSize: size, color: config.color };

  switch (config.category) {
    case 'document':
      if (fileType === 'pdf') {
        return <FilePdfOutlined style={iconStyle} />;
      }
      if (['doc', 'docx'].includes(fileType)) {
        return <FileWordOutlined style={iconStyle} />;
      }
      return <FileTextOutlined style={iconStyle} />;

    case 'spreadsheet':
      return <FileExcelOutlined style={iconStyle} />;

    case 'presentation':
      return <FilePptOutlined style={iconStyle} />;

    case 'image':
      return <FileImageOutlined style={iconStyle} />;

    case 'media':
      if (['mp3', 'wav'].includes(fileType)) {
        return <SoundOutlined style={iconStyle} />;
      }
      return <PlayCircleOutlined style={iconStyle} />;

    case 'archive':
      return <FileZipOutlined style={iconStyle} />;

    default:
      return <FileOutlined style={{ fontSize: size, color: '#8c8c8c' }} />;
  }
};

/**
 * Get file icon with default styling for cards/lists
 */
export const getFileIconLarge = (fileType: string): React.ReactNode => {
  return getFileIcon(fileType, 40);
};

/**
 * Get file icon for inline/compact display
 */
export const getFileIconSmall = (fileType: string): React.ReactNode => {
  return getFileIcon(fileType, 16);
};

/**
 * Get file icon for medium display (list items)
 */
export const getFileIconMedium = (fileType: string): React.ReactNode => {
  return getFileIcon(fileType, 24);
};
