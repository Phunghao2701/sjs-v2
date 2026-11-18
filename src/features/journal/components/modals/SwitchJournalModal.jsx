import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Modal } from '../../../shared/ui/modal';
import { Button } from '../../../shared/ui/button';
import { Input } from '../../../shared/ui/input';
import { Icon } from '@iconify/react';
import { useJournalManagement } from '../../hooks/useJournalManagement';

/**
 * Component SwitchJournalModal - Cửa sổ bật lên phục vụ Admin đổi nhanh Tạp chí đang làm việc.
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

  // Thực hiện bộ lọc tìm kiếm tạp chí nhanh ngay trên Modal
  const matchedJournals = journals.filter(j => (j.title || j.display_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (j.issn || '').includes(searchTerm));

  return (
    <Modal show={show} onHide={handleClose} centered className="text-foreground">
      <Modal.Header closeButton className="border-b-0 pb-0">
        <Modal.Title className="font-display font-bold text-lg text-foreground">{t("journal.chuyenDoiTapChiQuanLy")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3">
        {/* Ô nhập từ khóa lọc nhanh */}
        <div className="mb-3">
          <Input 
            type="text" 
            placeholder={t("journal.timTheoTenTapChiHoacMaIssn")} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>

        {/* Danh sách kết quả hiển thị */}
        <div className="overflow-y-auto max-h-[280px] divide-y divide-border border border-border rounded-lg">
          {matchedJournals.map(j => {
            const isCurrent = j.id === currentJournal?.id;
            return (
              <button
                key={j.id}
                type="button"
                disabled={isCurrent}
                onClick={() => {
                  setCurrentJournal(j.id);
                  setSearchTerm('');
                  handleClose();
                }}
                className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                  isCurrent 
                    ? 'bg-muted/40 cursor-default opacity-80' 
                    : 'hover:bg-muted/50 cursor-pointer'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-foreground truncate text-sm">{j.title}</div>
                  <small className="text-muted-foreground font-mono text-xs">ISSN: {j.issn}</small>
                </div>
                {isCurrent && (
                  <span className="bg-primary text-primary-foreground text-xs py-1 px-2 rounded-md flex items-center gap-1 shrink-0">
                    <Icon icon="lucide:check" width="12" /> Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-t-0 pt-0">
        <Button variant="outline" size="sm" onClick={handleClose}>{t("journal.dongLai")}</Button>
      </Modal.Footer>
    </Modal>
  );
}
