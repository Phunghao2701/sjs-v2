import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Badge } from '../../../../shared/ui/badge';
import { Button } from '../../../../shared/ui/button';

/**
 * Component VolumeList - Hiển thị danh sách các Tập (Volume) thuộc Tạp chí đang chọn.
 *
 * @param {Array} volumes - Danh sách các Volume đã được lọc theo Journal hiện tại
 * @param {string} selectedVolumeId - ID của Volume đang được chọn để xem Issue
 * @param {function} onSelectVolume - Hàm callback kích hoạt khi Admin bấm chọn một Volume
 */
export default function VolumeList({
  volumes,
  selectedVolumeId,
  onSelectVolume,
  volumeStatsById = {}
}) {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();

  // Dynamic route base path detection
  const isPreview = window.location.pathname.startsWith('/admin-preview');
  const basePath = isPreview ? '/admin-preview' : '/admin';

  // Trạng thái trống nếu Tạp chí này chưa được khởi tạo Volume nào
  if (!volumes || volumes.length === 0) {
    return (
      <div className="text-center py-5 bg-surface rounded-lg border border-border">
        <Icon icon="lucide:layers-3" width="32" className="text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm mb-0">{t("admin.chuaCoVolumeNaoDuocTao")}</p>
      </div>
    );
  }

  // Sort volumes descending by year or number to match Figma (newest at top)
  const sortedVolumes = [...volumes].sort((a, b) => b.publicationYear - a.publicationYear);

  return (
    <div className="flex flex-col gap-3 text-left">
      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-surface shadow-2xs">
        {sortedVolumes.map((vol, index) => {
          const isSelected = vol.id === selectedVolumeId;
          const isNewest = index === 0;
          const volumeStats = volumeStatsById[vol.id] || {};
          const issueCount = volumeStats.issueCount ?? 0;
          const articleCount = volumeStats.articleCount;

          return (
            <button
              key={vol.id}
              type="button"
              onClick={() => onSelectVolume(vol.id)}
              className={`w-full flex justify-between items-center py-3.5 px-4 text-left transition-colors border-0 cursor-pointer ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface text-foreground hover:bg-muted/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {vol.volumeNumber} ({vol.publicationYear})
                  </span>
                  
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : isNewest
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isNewest ? 'CURRENT' : 'ARCHIVED'}
                  </span>
                </div>
                <small className={`font-mono text-xs block mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {issueCount} Issues • {typeof articleCount === 'number' ? `${articleCount} Articles` : t("admin.chuaCoApiArticleTheoIssueidDaX")}
                </small>
              </div>
              
              <Badge variant={isSelected ? 'secondary' : 'outline'} className="rounded px-2 py-0.5 text-xs font-semibold">
                Select
              </Badge>
            </button>
          );
        })}
      </div>

      {/* View All Archive trigger from Figma Screen Page 4 */}
      <Button
        variant="outline"
        className="w-full py-2 flex items-center justify-center gap-1.5 border-dashed border-border"
        onClick={() => navigate(`${basePath}/volumes`)}
      >
        <Icon icon="lucide:archive" width="16" />
        <span>View All Archive</span>
      </Button>
    </div>
  );
}
