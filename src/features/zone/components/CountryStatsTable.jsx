import { useTranslation } from "react-i18next";
import React, { useState, useMemo } from 'react';
import { Table } from '../../../shared/ui/table';
import { Icon } from '@iconify/react';
import AdminPagination from '../../../shared/components/Pagination';

export default function CountryStatsTable({
  countries = [],
  selectedCountry = null,
  onSelectCountry
}) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('article_count'); // 'name' or 'article_count'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter countries by search term
  const filteredCountries = useMemo(() => {
    return countries.filter(c =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.iso_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [countries, searchTerm]);

  // Sort countries
  const sortedCountries = useMemo(() => {
    const sorted = [...filteredCountries];
    sorted.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'article_count') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredCountries, sortKey, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedCountries.length / itemsPerPage);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedCountries = sortedCountries.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className="p-4 rounded-card border border-border bg-surface flex flex-col h-full min-h-[520px]">
      {/* Table Header / Action Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-foreground text-base mb-1">
            {t("zone.thongKeTheoQuocGia", "Thống kê theo quốc gia")}
          </h2>
          <p className="text-muted-foreground text-xs m-0">
            {t("zone.danhSachCacQuocGiaCungTongSoLu", "Danh sách các quốc gia cùng tổng số lượng bài báo")}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <div className="flex items-center px-3 py-1.5 rounded-lg border border-border bg-surface-muted/40 transition-colors focus-within:border-primary">
          <Icon icon="lucide:search" width="16" className="text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder={t("zone.timKiemQuocGia", "Tìm kiếm quốc gia...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-foreground text-sm outline-none border-none p-0 focus:ring-0"
          />
          {searchTerm && (
            <button
              type="button"
              className="bg-transparent border-0 p-0 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => setSearchTerm('')}
            >
              <Icon icon="lucide:x" width="16" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <Table className="min-w-[400px] text-sm">
          <thead className="bg-surface-muted/40 border-b border-border">
            <tr>
              <th className="py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase w-[50px]">
                #
              </th>
              <th
                className="py-2.5 text-muted-foreground font-semibold text-xs uppercase cursor-pointer select-none"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>{t("journal.quocGia", "Quốc gia")}</span>
                  <Icon
                    icon={sortKey === 'name' ? (sortOrder === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down') : 'lucide:arrow-up-down'}
                    width="12"
                    className="text-muted-foreground"
                  />
                </div>
              </th>
              <th className="py-2.5 text-muted-foreground font-semibold text-xs uppercase w-[70px]">
                {t("zone.ma", "Mã")}
              </th>
              <th
                className="py-2.5 text-muted-foreground font-semibold text-xs uppercase cursor-pointer select-none"
                onClick={() => toggleSort('article_count')}
              >
                <div className="flex items-center gap-1">
                  <span>{t("articles", "Bài báo")}</span>
                  <Icon
                    icon={sortKey === 'article_count' ? (sortOrder === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down') : 'lucide:arrow-up-down'}
                    width="12"
                    className="text-muted-foreground"
                  />
                </div>
              </th>
              <th className="py-2.5 pr-3 text-right text-muted-foreground font-semibold text-xs uppercase w-[100px]">
                {t("article.chiTiet1", "Chi tiết")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCountries.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-muted-foreground text-sm">
                  {t("zone.khongTimThayQuocGiaPhuHop", "Không tìm thấy quốc gia phù hợp")}
                </td>
              </tr>
            ) : (
              paginatedCountries.map((country, index) => {
                const globalIndex = startIndex + index + 1;
                const isSelected = selectedCountry?.code === country.code;
                return (
                  <tr
                    key={country.zone_id || country.code}
                    className={`transition-colors duration-150 cursor-pointer border-b border-border hover:bg-surface-muted/40 ${
                      isSelected ? 'bg-primary-subtle font-semibold' : ''
                    }`}
                    onClick={() => onSelectCountry(country)}
                  >
                    <td className="px-3 text-muted-foreground font-mono text-xs">
                      {globalIndex}
                    </td>
                    <td className="py-2.5 text-foreground font-medium">
                      {country.name || '—'}
                    </td>
                    <td className="text-muted-foreground font-mono text-xs">
                      {country.code || country.iso_code || '—'}
                    </td>
                    <td className="text-foreground font-bold font-mono">
                      {Number(country.article_count || 0).toLocaleString()}
                    </td>
                    <td className="pr-3 text-right">
                      <button
                        type="button"
                        className="text-primary hover:text-primary-hover p-0 inline-flex items-center gap-1 text-xs font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCountry(country);
                        }}
                      >
                        <span>Xem region</span>
                        <Icon icon="lucide:chevron-right" width="14" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {sortedCountries.length > 0 && totalPages > 1 && (
        <div className="mt-3 pt-3 border-t border-border">
          <AdminPagination
            totalItems={sortedCountries.length}
            currentPage={safeCurrentPage}
            limit={itemsPerPage}
            onPageChange={handlePageChange}
            entityName="quốc gia"
          />
        </div>
      )}
    </div>
  );
}
