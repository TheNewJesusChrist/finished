import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, Presentation, CheckCircle, AlertCircle, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading, uploadProgress = 0 }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadStatus('idle');
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-12 w-12 text-red-500" />;
      case 'ppt':
      case 'pptx':
        return <Presentation className="h-12 w-12 text-orange-500" />;
      default:
        return <FileText className="h-12 w-12 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <motion.div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-[#3CA7E0] bg-[#5ED3F3]/10 shadow-lg shadow-[#AEEBF9]/30'
              : 'border-[#CBD5E1] hover:border-[#3CA7E0] hover:bg-[#5ED3F3]/5'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <motion.div
              animate={{ 
                y: isDragActive ? -10 : 0,
                rotate: isDragActive ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <Upload className="h-12 w-12 text-[#3CA7E0] mx-auto" />
            </motion.div>
            
            <div>
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-2">
                {isDragActive ? 'Drop your files here' : 'Upload Learning Material'}
              </h3>
              <p className="text-[#BFC9D9] mb-4">
                Drag and drop PDF or PowerPoint files, or click to browse
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-[#BFC9D9]">
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-[#BFC9D9]">
                <Presentation className="h-4 w-4" />
                <span>PowerPoint</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl border-2 border-[#CBD5E1] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.name)}
              <div>
                <h4 className="text-lg font-semibold text-[#2E3A59]">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-[#BFC9D9]">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isUploading && (
              <motion.button
                onClick={removeFile}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </div>

          {isUploading && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-[#2E3A59] mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                <motion.div
                  className="bg-[#3CA7E0] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Upload successful!</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Upload failed. Please try again.</span>
            </div>
          )}
        </motion.div>
      )}
      
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs text-[#BFC9D9]">
          Maximum file size: 10MB. Supported formats: PDF, PPT, PPTX
        </p>
      </motion.div>
    </div>
  );
};

export default FileUpload;