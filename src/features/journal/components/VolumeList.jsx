import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Badge } from '../../../shared/ui/badge';

/**
 * Component VolumeList - Hiển thị danh sách các Tập (Volume) thuộc Tạp chí đang chọn.
 */
export default function VolumeList({
  volumes,
  selectedVolumeId,
  onSelectVolume
}) {
  const { t } = useTranslation();

  if (!volumes || volumes.length === 0) {
    return (
      <div className="text-center py-6 bg-surface-muted/40 rounded-card border border-border">
        <Icon icon="lucide:layers-3" width="32" className="text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-xs m-0">{t("admin.chuaCoVolumeNaoDuocTao", "Chưa có Volume nào được tạo")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border divide-y divide-border overflow-hidden bg-surface shadow-xs">
      {volumes.map((vol) => {
        const isSelected = vol.id === selectedVolumeId;
        return (
          <button
            key={vol.id}
            type="button"
            onClick={() => onSelectVolume(vol.id)}
            className={`w-full flex justify-between items-center px-4 py-3 text-left transition-colors ${
              isSelected
                ? 'bg-primary text-white'
                : 'hover:bg-surface-muted/50 text-foreground'
            }`}
          >
            <div>
              <div className="font-semibold text-sm">
                {vol.volumeNumber}
              </div>
              <div className={`text-xs font-mono mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                {t("article.namXuatBan", "Năm xuất bản: ")}{vol.publicationYear}
              </div>
            </div>

            <Badge
              variant={isSelected ? "outline" : "secondary"}
              className={`text-xs px-2.5 py-0.5 rounded-full ${isSelected ? 'border-white/30 text-white bg-white/10' : ''}`}
            >
              {vol.totalIssues || 0} Issues
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
