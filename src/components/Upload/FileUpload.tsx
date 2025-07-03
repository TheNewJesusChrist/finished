import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, Presentation, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
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

  return (
    <div className="w-full max-w-2xl mx-auto">
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
            {isUploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CA7E0]"></div>
              </div>
            ) : uploadStatus === 'success' ? (
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            ) : uploadStatus === 'error' ? (
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            ) : (
              <Upload className="h-12 w-12 text-[#3CA7E0] mx-auto" />
            )}
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold text-[#2E3A59] mb-2">
              {isDragActive ? 'Drop your files here' : 'Upload Learning Material'}
            </h3>
            <p className="text-[#BFC9D9] mb-4">
              {isUploading 
                ? 'Uploading your file...' 
                : 'Drag and drop PDF or PowerPoint files, or click to browse'
              }
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