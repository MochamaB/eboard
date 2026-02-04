/**
 * Minutes Signatures Table (Mock Data)
 * Digital signatures for approved and published minutes
 */

export type MinutesSignatureMethod = 'digital' | 'biometric' | 'pin';

export interface MinutesSignatureRow {
  id: string;
  minutesId: string;

  // Signer
  signedBy: number;
  signerRole: string;
  signerName: string;

  // Digital signature
  signatureHash: string;
  signatureMethod: MinutesSignatureMethod;
  certificateId: string | null;

  // Verification
  verified: boolean;
  verificationDate: string | null;

  signedAt: string;

  // Optional: Image/data
  signatureData: string | null;
}

export const minutesSignaturesTable: MinutesSignatureRow[] = [
  // ========================================================================
  // MTG-008: KETEPA Board - Published minutes signatures
  // ========================================================================

  // Chairman signature
  {
    id: 'sig-minutes-mtg008-001',
    minutesId: 'minutes-mtg008-001',
    signedBy: 3,
    signerRole: 'Chairman',
    signerName: 'Mathews Odiero',
    signatureHash: 'sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    signatureMethod: 'digital',
    certificateId: 'CERT-KTDA-2025-003',
    verified: true,
    verificationDate: '2025-01-22T10:00:00Z',
    signedAt: '2025-01-22T10:00:00Z',
    signatureData: null,
  },

  // Secretary signature
  {
    id: 'sig-minutes-mtg008-002',
    minutesId: 'minutes-mtg008-001',
    signedBy: 18,
    signerRole: 'Board Secretary',
    signerName: 'Isaac Chege',
    signatureHash: 'sha256:z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1',
    signatureMethod: 'digital',
    certificateId: 'CERT-KTDA-2025-018',
    verified: true,
    verificationDate: '2025-01-22T10:05:00Z',
    signedAt: '2025-01-22T10:05:00Z',
    signatureData: null,
  },

  // ========================================================================
  // MTG-006: Finance Committee - Approved minutes signatures
  // ========================================================================

  // Committee Chair signature
  {
    id: 'sig-minutes-mtg006-001',
    minutesId: 'minutes-mtg006-001',
    signedBy: 4,
    signerRole: 'Committee Chair',
    signerName: 'Hon. G.G Kagombe',
    signatureHash: 'sha256:1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
    signatureMethod: 'digital',
    certificateId: 'CERT-KTDA-2025-004',
    verified: true,
    verificationDate: '2026-01-09T16:00:00Z',
    signedAt: '2026-01-09T16:00:00Z',
    signatureData: null,
  },

  // Secretary signature
  {
    id: 'sig-minutes-mtg006-002',
    minutesId: 'minutes-mtg006-001',
    signedBy: 18,
    signerRole: 'Board Secretary',
    signerName: 'Isaac Chege',
    signatureHash: 'sha256:6z5y4x3w2v1u0t9s8r7q6p5o4n3m2l1k0j9i8h7g6f5e4d3c2b1a',
    signatureMethod: 'digital',
    certificateId: 'CERT-KTDA-2025-018',
    verified: true,
    verificationDate: '2026-01-09T16:05:00Z',
    signedAt: '2026-01-09T16:05:00Z',
    signatureData: null,
  },
];
