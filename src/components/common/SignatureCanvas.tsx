/**
 * SignatureCanvas Component
 * Canvas for drawing digital signatures
 * Supports drawing, clearing, and exporting as base64 image
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Space, Typography } from 'antd';
import { ClearOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  lineColor?: string;
  lineWidth?: number;
  backgroundColor?: string;
  onSignatureChange?: (signatureDataUrl: string | null) => void;
  disabled?: boolean;
  initialSignature?: string;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  width = 400,
  height = 150,
  lineColor = '#1a365d',
  lineWidth = 2,
  backgroundColor = '#fafafa',
  onSignatureChange,
  disabled = false,
  initialSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);

    // Load initial signature if provided
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, [width, height, lineColor, lineWidth, backgroundColor, initialSignature]);

  // Get coordinates from mouse/touch event
  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  // Start drawing
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || !context) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(coords.x, coords.y);
  }, [disabled, context, getCoordinates]);

  // Draw
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || !context) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    context.lineTo(coords.x, coords.y);
    context.stroke();
    setHasSignature(true);
  }, [isDrawing, disabled, context, getCoordinates]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    
    if (context) {
      context.closePath();
    }

    // Export signature
    if (canvasRef.current && onSignatureChange) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSignatureChange(hasSignature ? dataUrl : null);
    }
  }, [isDrawing, context, onSignatureChange, hasSignature]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!context || !canvasRef.current) return;

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    setHasSignature(false);
    
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  }, [context, backgroundColor, width, height, onSignatureChange]);

  // Expose methods via ref (optional)
  useEffect(() => {
    if (onSignatureChange && hasSignature && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  }, [hasSignature, onSignatureChange]);

  return (
    <div className="signature-canvas-container">
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          overflow: 'hidden',
          background: backgroundColor,
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            width: '100%',
            height: 'auto',
            cursor: disabled ? 'not-allowed' : 'crosshair',
            touchAction: 'none',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {/* Signature line */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            left: 20,
            right: 20,
            borderBottom: '1px dashed #bfbfbf',
          }}
        />
        
        {/* Placeholder text */}
        {!hasSignature && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#bfbfbf',
              fontSize: 14,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            Sign here
          </div>
        )}
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Draw your signature above
        </Text>
        <Space>
          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={clearCanvas}
            disabled={disabled || !hasSignature}
          >
            Clear
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default SignatureCanvas;
