import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Modal } from '../../../../shared/ui/modal';
import { Icon } from '@iconify/react';
import { Button } from '../../../../shared/ui/button';
import { useJournalManagement } from '../../../journal/hooks/useJournalManagement';

/**
 * Component SwitchJournalModal - Cửa sổ bật lên phục vụ Admin đổi nhanh Tạp chí đang làm việc.
 * Thiết kế khớp 100% với Figma Hình 4.
 */
export default function SwitchJournalModal({
  show,
  handleClose
}) {
  const { t } = useTranslation();
  const {
    journals,
    currentJournal,
    setCurrentJournal
  } = useJournalManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedId, setTempSelectedId] = useState(null);

  // Sync tempSelectedId when currentJournal changes or modal opens
  useEffect(() => {
    if (currentJournal) {
      setTempSelectedId(currentJournal.id);
    }
  }, [currentJournal, show]);

  // Thực hiện bộ lọc tìm kiếm tạp chí nhanh ngay trên Modal
  const matchedJournals = (journals || []).filter(j => (j.title || j.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (j.issn || '').includes(searchTerm));
  const handleConfirmSelect = () => {
    if (tempSelectedId) {
      setCurrentJournal(tempSelectedId);
      setSearchTerm('');
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="text-foreground">
      <Modal.Header closeButton className="border-b-0 pb-0">
        <div>
          <Modal.Title className="font-display font-bold text-xl text-foreground mb-1">Switch Journal</Modal.Title>
          <small className="text-muted-foreground text-sm">
            Select which repository context you wish to manage.
          </small>
        </div>
      </Modal.Header>
      
      <Modal.Body className="py-3 text-left">
        {/* Ô nhập từ khóa lọc nhanh */}
        <div className="mb-3">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-muted-foreground pointer-events-none">
              <Icon icon="lucide:search" width="16" />
            </span>
            <input
              type="text"
              placeholder={t("admin.filterJournalsByNameOrIssn")}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0"
            />
          </div>
        </div>

        {/* Danh sách kết quả hiển thị */}
        <div className="overflow-y-auto max-h-[320px] flex flex-col gap-2 pr-1">
          {matchedJournals.map(j => {
            const isCurrent = j.id === currentJournal?.id;
            const isTempSelected = j.id === tempSelectedId;
            return (
              <div
                key={j.id}
                onClick={() => setTempSelectedId(j.id)}
                className={`admin-switch-journal-item rounded-lg p-3 flex items-center justify-between transition-colors cursor-pointer border ${
                  isTempSelected ? 'border-primary ring-1 ring-primary bg-primary-subtle/10' : 'border-border bg-surface hover:bg-muted/30'
                }`}
              >
                <div className="admin-switch-journal-item__main flex items-center gap-3">
                  <div className="admin-switch-journal-item__icon size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                    <Icon icon="lucide:book" width="18" />
                  </div>
                  <div className="admin-switch-journal-item__content">
                    <div className="admin-switch-journal-item__title-row flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{j.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                          Current
                        </span>
                      )}
                    </div>
                    <small className="text-muted-foreground text-xs block mt-0.5">
                      {j.subjectCategory || 'General Science'} • ISSN: {j.issn}
                    </small>
                  </div>
                </div>

                <div className="admin-switch-journal-item__side">
                  <span className={`px-2 py-1 rounded-full uppercase text-[10px] font-semibold ${
                    j.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-muted text-muted-foreground'
                  }`}>
                    {j.status || 'Draft'}
                  </span>
                </div>
              </div>
            );
          })}
          {matchedJournals.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No journals match your filter criteria.
            </div>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-t-0 pt-0 flex justify-end items-center gap-3">
        <Button variant="outline" size="sm" onClick={handleClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleConfirmSelect} disabled={!tempSelectedId}>
          Select Journal
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
