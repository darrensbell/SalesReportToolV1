
import { useState } from 'react';
import CSVImportModal from '../components/CSVImportModal';
import { useRouter } from 'next/router';

export default function IngestPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const router = useRouter();

  function handleClose() {
    setIsModalOpen(false);
    router.push('/');
  }

  function handleImport() {
    router.push('/');
  }

  return (
    <div>
      <CSVImportModal
        isOpen={isModalOpen}
        onRequestClose={handleClose}
        onImport={handleImport}
      />
    </div>
  );
}
