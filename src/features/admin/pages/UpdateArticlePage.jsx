import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { PrimaryInformationSection, MetadataSection, ManuscriptFilesSection, ReviewStatusPanel, DeleteArticleModal } from '../components/update-article';
import { toast } from '../../../shared/utils/toast';
import useUpdateArticle from '../hooks/useUpdateArticle';
import { PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
export default function UpdateArticlePage() {
  const { t: _t } = useTranslation();
  const {
    id,
    loading,
    error,
    submitting,
    title,
    setTitle,
    leadAuthor,
    setLeadAuthor,
    journal,
    setJournal,
    abstract,
    setAbstract,
    keywords,
    setKeywords,
    submissionDate,
    setSubmissionDate,
    status,
    setStatus,
    stats,
    originalData,
    showDeleteModal,
    setShowDeleteModal,
    handleUpdate,
    handleCancel,
    handleConfirmDelete
  } = useUpdateArticle();
  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <StatePanel
          variant="error"
          title="Error Loading Article"
          description={error}
        />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Management' },
          { label: 'Articles', to: '/admin/articles' },
          { label: 'Update Article' }
        ]}
        title="Update Article"
        description="Modify manuscript details, metadata, and publication status for the selected research record."
      />

      <div className={`admin-update-article-row${submitting ? ' admin-form-disabled' : ''}`}>
        <div className="admin-update-article-main">
          <PrimaryInformationSection title={title} leadAuthor={leadAuthor} journal={journal} journalOptions={originalData ? [originalData.journal] : [journal]} onChangeTitle={setTitle} onChangeLeadAuthor={val => {
          // This is UI only for now, since BE authors update needs author IDs
          setLeadAuthor(val);
          toast.info(t("admin.chinhSuaLeadAuthorChiCoTacDung"));
        }} onChangeJournal={val => {
          // Same here, BE requires issue_id to change journals
          setJournal(val);
        }} />

          <MetadataSection abstract={abstract} keywords={keywords} submissionId={`ART-${id}`} submissionDate={submissionDate} onChangeAbstract={setAbstract} onChangeKeywords={setKeywords} onChangeSubmissionDate={val => {
          setSubmissionDate(val);
        }} />

          <ManuscriptFilesSection files={[]} />
        </div>

        <ReviewStatusPanel status={status} onChangeStatus={setStatus} stats={stats} onUpdate={handleUpdate} onCancel={handleCancel} onDelete={() => setShowDeleteModal(true)} />
      </div>

      <DeleteArticleModal show={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} articleTitle={title} />
    </div>
  );
}