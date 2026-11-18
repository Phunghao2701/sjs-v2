import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Modal } from '../../../shared/ui/modal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../../shared/ui/table';
import { Button } from '../../../shared/ui/button';

const ManageKeywordsModal = ({
  show,
  onHide,
  watchedKeywords,
  onRemove,
  actionLoading,
}) => {
  const { t } = useTranslation();

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-base font-semibold text-foreground">
          {t('keyword.quanLyKeywordWatchList', 'Quản lý Keyword Watch List')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4">
        {Array.isArray(watchedKeywords) && watchedKeywords.length > 0 ? (
          <div className="rounded-card border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Keyword</TableHead>
                  <TableHead className="font-medium text-right">{t('journal.hanhDong', 'Hành động')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchedKeywords.map((kw, idx) => {
                  const label = typeof kw === 'string' ? kw : kw.keyword || kw.name;
                  const id = typeof kw === 'string' ? kw : kw.id || kw.keywordId;
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-foreground">{label}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:text-danger hover:bg-danger/10 gap-1.5 h-8 px-2"
                          onClick={() => onRemove(id)}
                          disabled={actionLoading}
                        >
                          <Icon icon="lucide:trash-2" width="14" height="14" />
                          <span>{t('keyword.xoa', 'Xóa')}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t('keyword.chuaCoKeywordNaoTrongDanhSachT', 'Chưa có keyword nào trong danh sách theo dõi.')}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline" size="sm" onClick={onHide}>
          {t('article.dong', 'Đóng')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageKeywordsModal;
