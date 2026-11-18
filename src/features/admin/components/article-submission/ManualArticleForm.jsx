import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import KeywordInput from './KeywordInput';
import { getSubjectCategoriesApi } from '../../../catalog/api/catalogApi';
import { searchJournalsApi } from '../../../journal/api/journalApi';

/**
 * ManualArticleForm Component
 * Renders manual entry input form for submit article flow.
 */
export default function ManualArticleForm({
  formData = {},
  onChange
}) {
  const { t } = useTranslation();
  const [journals, setJournals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Load selection options from active system APIs
  useEffect(() => {
    const fetchSelectionOptions = async () => {
      setLoadingOptions(true);
      try {
        const [catsRes, journalsRes] = await Promise.all([
          getSubjectCategoriesApi({ limit: 1000 }),
          searchJournalsApi({ limit: 100 })
        ]);
        if (catsRes?.data) {
          const rawCats = catsRes.data.data || catsRes.data;
          const list = Array.isArray(rawCats) ? rawCats : rawCats?.items || [];
          const uniqueCats = list.filter((c, index, self) => self.findIndex(t => (t.display_name || t.name) === (c.display_name || c.name)) === index);
          setCategories(uniqueCats);
        }
        if (journalsRes?.data) {
          const rawJournals = journalsRes.data.data || journalsRes.data;
          const list = Array.isArray(rawJournals) ? rawJournals : rawJournals?.items || [];
          const uniqueJournals = list.filter((j, index, self) => self.findIndex(t => (t.display_name || t.name || t.title) === (j.display_name || j.name || j.title)) === index);
          setJournals(uniqueJournals);
        }
      } catch (err) {
        console.warn('Could not load categories/journals from API:', err);
        setCategories([]);
        setJournals([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchSelectionOptions();
  }, []);

  const handleFieldChange = (key, value) => {
    onChange({
      ...formData,
      [key]: value
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="articleTitle" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
          Article Title <span className="text-destructive">*</span>
        </label>
        <input
          id="articleTitle"
          type="text"
          placeholder={t("admin.egQuantumNeuralDynamicsInSynth")}
          value={formData.title || ''}
          onChange={e => handleFieldChange('title', e.target.value)}
          required
          className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="articleAbstract" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
          Abstract <span className="text-destructive">*</span>
        </label>
        <textarea
          id="articleAbstract"
          rows={5}
          placeholder={t("admin.provideAConciseSummaryOfYourRe")}
          value={formData.abstract || ''}
          onChange={e => handleFieldChange('abstract', e.target.value)}
          required
          className="account-form-input w-full p-3 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-y"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            Keywords
          </label>
          <KeywordInput
            keywords={formData.keywords || []}
            onChange={kwList => handleFieldChange('keywords', kwList)}
            placeholder={t("admin.typeKeywordAndPressEnter")}
          />
        </div>

        <div>
          <label htmlFor="articleAuthor" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            Author Name <span className="text-destructive">*</span>
          </label>
          <input
            id="articleAuthor"
            type="text"
            placeholder={t("admin.fullNameAsItAppearsInPublicati")}
            value={formData.author || ''}
            onChange={e => handleFieldChange('author', e.target.value)}
            required
            className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="articleJournal" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            Journal Selection <span className="text-destructive">*</span>
          </label>
          <select
            id="articleJournal"
            value={formData.journalId || ''}
            onChange={e => handleFieldChange('journalId', e.target.value)}
            required
            className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Choose a journal...</option>
            {!loadingOptions && journals.length === 0 && <option value="" disabled>{t("admin.chuaCoApiDanhSachJournalDaXoaD")}</option>}
            {journals.map(j => (
              <option key={j.id || j.journal_id} value={j.id || j.journal_id}>
                {j.display_name || j.name || j.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="articleCategory" className="account-form-label block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
            Section / Category <span className="text-destructive">*</span>
          </label>
          <select
            id="articleCategory"
            value={formData.categoryId || ''}
            onChange={e => handleFieldChange('categoryId', e.target.value)}
            required
            className="account-form-input w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="">Select category...</option>
            {!loadingOptions && categories.length === 0 && <option value="" disabled>{t("admin.chuaCoApiDanhSachCategoryDaXoa")}</option>}
            {categories.map(c => (
              <option key={c.id || c.subject_category_id} value={c.id || c.subject_category_id}>
                {c.display_name || c.name || c.category_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
