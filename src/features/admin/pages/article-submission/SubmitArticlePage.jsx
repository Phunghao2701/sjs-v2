import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../../shared/components/Icon';
import SubmissionTabs from '../../components/article-submission/SubmissionTabs';
import ManualArticleForm from '../../components/article-submission/ManualArticleForm';
import PdfDropzone from '../../components/article-submission/PdfDropzone';
import UploadFeatureCard from '../../components/article-submission/UploadFeatureCard';
import { useAdminStore } from '../../../../app/store/adminStore';
import { Button } from '../../../../shared/ui/button';
import { PageHeader } from '../../../../shared/ui/page-layout';
import { Card } from '../../../../shared/ui/card';
import { Modal } from '../../../../shared/ui/modal';

/**
 * SubmitArticlePage Component
 * Orchestrates the full submit article flow (Page 15 & 16).
 */
export default function SubmitArticlePage() {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const { saveDraft } = useAdminStore();

  // Tab State
  const [activeTab, setActiveTab] = useState('manual');

  // Shared state: values are preserved when switching tabs
  const [manualFormData, setManualFormData] = useState({
    title: '',
    abstract: '',
    keywords: [],
    author: '',
    journalId: '',
    categoryId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Operation / Feedback UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSaveDraft = () => {
    const draftItem = {
      type: activeTab,
      data: activeTab === 'manual' ? manualFormData : {
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size
      },
      savedAt: new Date().toLocaleTimeString()
    };
    saveDraft(draftItem);
    alert(`Draft saved successfully at ${draftItem.savedAt}!`);
  };

  const handleSubmitArticle = async (e) => {
    e.preventDefault();

    if (activeTab === 'manual') {
      const { title, abstract, author, journalId, categoryId, keywords } = manualFormData;
      if (!title || !abstract || !author || !journalId || !categoryId) {
        alert('Please fill out all required fields indicated by (*)');
        return;
      }

      try {
        setIsSubmitting(true);
        const { createArticleApi } = await import('../../../article/api/articleApi');
        const payload = {
          title,
          abstract,
          journal_id: parseInt(journalId, 10),
          category_id: parseInt(categoryId, 10),
          authors: [{ full_name: author }],
          keywords: keywords && keywords.length > 0 ? keywords : ['Research']
        };

        await createArticleApi(payload);
        setIsSubmitting(false);
        setSuccessInfo({
          mode: 'manual',
          title: title,
          author: author
        });
        setShowSuccessModal(true);
      } catch (err) {
        setIsSubmitting(false);
        alert('Error submitting article: ' + (err.response?.data?.message || err.message));
      }
    } else {
      if (!selectedFile) {
        alert('Please select or drop a valid PDF manuscript to submit.');
        return;
      }
      setIsSubmitting(true);
      setIsSubmitting(false);
      alert(t("admin.chaCaApiSubmitPdfArticleAaXaaD"));
    }
  };

  const resetSubmissionForm = () => {
    setManualFormData({
      title: '',
      abstract: '',
      keywords: [],
      author: '',
      journalId: '',
      categoryId: ''
    });
    setSelectedFile(null);
    setShowSuccessModal(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Articles', to: '/admin/articles' },
          { label: 'New Submission' }
        ]}
        title="Submit Article"
        description="Provide manuscript details or upload PDF files to register research publications in the repository."
        actions={
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5"
          >
            <Icon icon="lucide:save" width="14" />
            <span>Save Draft</span>
          </Button>
        }
      />

      <div className="mx-auto max-w-[850px]">
        {/* Primary submission wrapper card */}
        <Card className="p-6 md:p-8 rounded-2xl border border-border bg-surface shadow-2xs mb-6 text-left">
          {/* Tab nav selectors */}
          <SubmissionTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <form onSubmit={handleSubmitArticle}>
            {/* Conditional Tab Body Rendering */}
            <div className="py-2 mb-4">
              {activeTab === 'manual' ? (
                <ManualArticleForm formData={manualFormData} onChange={setManualFormData} />
              ) : (
                <div className="flex flex-col gap-4">
                  <PdfDropzone selectedFile={selectedFile} onFileSelect={setSelectedFile} onFileRemove={() => setSelectedFile(null)} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                    <UploadFeatureCard title="OCR Processing" description="System automatically extracts metadata from your uploaded PDF." icon="lucide:scan-eye" />
                    <UploadFeatureCard title="Secure Upload" description="Encrypted storage ensures your intellectual property is protected." icon="lucide:lock" />
                    <UploadFeatureCard title="Fast Review" description="Uploaded PDFs enter the review queue immediately." icon="lucide:zap" />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom-right alignment Submit Action Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={isSubmitting} className="px-6 py-2 min-w-[150px]">
                {isSubmitting ? (
                  <>
                    <Icon icon="lucide:loader-2" width="16" className="mr-2" />
                    Submitting...
                  </>
                ) : 'Submit Article'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Success modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered className="text-foreground">
        <Modal.Body className="p-6 md:p-8 text-center">
          <div className="size-16 rounded-full inline-flex items-center justify-center mb-4 bg-primary-subtle text-primary">
            <Icon icon="lucide:check-circle" width="36" />
          </div>

          <h3 className="font-display font-bold text-foreground text-xl mb-2">Submission Successful!</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Your manuscript has been safely received. The review board and OCR pipelines will evaluate this entry.
          </p>

          {successInfo && (
            <div className="p-3.5 rounded-lg border border-border mb-4 text-left bg-muted/40 text-sm">
              <div className="mb-2">
                <span className="text-muted-foreground">Mode: </span>
                <strong className="text-foreground capitalize">{successInfo.mode} Entry</strong>
              </div>
              <div className="mb-2 truncate">
                <span className="text-muted-foreground">Identifier: </span>
                <strong className="text-foreground">{successInfo.title}</strong>
              </div>
              <div className="truncate">
                <span className="text-muted-foreground">Author: </span>
                <strong className="text-foreground">{successInfo.author}</strong>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <Button className="py-2.5" onClick={() => {
              setShowSuccessModal(false);
              navigate('/dashboard');
            }}>
              Go to Dashboard
            </Button>
            <Button variant="outline" className="py-2" onClick={resetSubmissionForm}>
              Submit Another Article
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
