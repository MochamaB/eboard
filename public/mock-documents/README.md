# Mock Documents Folder

This folder contains sample PDF files used for testing the document viewer in development mode.

## Structure

```
mock-documents/
  ├── sample.pdf          (Generic sample PDF for all documents)
  └── README.md           (This file)
```

## How It Works

1. The mock data in `src/mocks/db/tables/documents.ts` contains document metadata
2. Each document has a `url` property pointing to `/mock-documents/sample.pdf`
3. When you click a document, the viewer loads this sample PDF
4. All documents currently show the same sample PDF (this is fine for development)

## Adding More Sample PDFs (Optional)

If you want different PDFs for different documents:

1. Create PDFs using:
   - Online tools: https://www.adobe.com/acrobat/online/create-pdf.html
   - Microsoft Word: File → Save As → PDF
   - Browser: Print → Save as PDF

2. Save them in this folder with descriptive names:
   ```
   mock-documents/
     ├── board-pack.pdf
     ├── minutes.pdf
     ├── financial-report.pdf
     └── presentation.pdf
   ```

3. Update the mock data URLs in `src/mocks/db/tables/documents.ts`:
   ```typescript
   url: '/mock-documents/board-pack.pdf'
   ```

## Production

In production, the backend API will:
- Store actual files in cloud storage (Azure Blob, AWS S3, etc.)
- Return real URLs to those files
- This folder is only for development/testing
