import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../shared/ui/modal';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';

const AddKeywordModal = ({
  show,
  onHide,
  onAdd,
  actionLoading,
}) => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    try {
      await onAdd(keyword.trim());
      setKeyword('');
      onHide();
    } catch {
      // Error handled by hook or parent
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-base font-semibold text-foreground">
          {t('keyword.themKeywordTheoDoi', 'Thêm Keyword theo dõi')}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit} className="mt-3">
        <Modal.Body className="py-2 space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="keywordInput" className="block text-xs font-medium text-muted-foreground">
              {t('keyword.nhapTuKhoaKeyword', 'Nhập từ khóa (Keyword)')}
            </label>
            <Input
              id="keywordInput"
              type="text"
              placeholder={t('keyword.viDuLargeLanguageModel', 'Ví dụ: Large Language Model')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={actionLoading}
              required
              autoFocus
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2 flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onHide}
            disabled={actionLoading}
          >
            {t('admin.huy', 'Hủy')}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={actionLoading || !keyword.trim()}
            isLoading={actionLoading}
          >
            {actionLoading ? t('keyword.dangThem', 'Đang thêm...') : t('keyword.themKeyword', 'Thêm Keyword')}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default AddKeywordModal;
