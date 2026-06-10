import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../api';

export default function Upload({ onUpload }) {
  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    try {
      const response = await uploadFile(formData);
      onUpload(response.data.task_id);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      <p> Drag & drop a CSV/Excel file, or click to select</p>
    </div>
  );
}

const dropzoneStyle = {
  border: '2px dashed #ccc',
  borderRadius: '8px',
  padding: '2rem',
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '2rem'
};