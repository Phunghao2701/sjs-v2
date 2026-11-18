import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/utils';

/**
 * Shadcn-backed Modal component providing a modern accessible dialog
 * with an API compatible with both standard Dialog and Bootstrap Modal patterns.
 */
function ModalRoot({
  show,
  onHide,
  children,
  size = 'md',
  backdrop = true,
  centered = true,
  dialogClassName = '',
  contentClassName = '',
  style = {},
  ...props
}) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    fullscreen: 'max-w-full h-full m-0 rounded-none',
  }[size] || 'max-w-lg';

  return (
    <DialogPrimitive.Root open={Boolean(show)} onOpenChange={(open) => { if (!open && onHide) onHide(); }}>
      <DialogPrimitive.Portal>
        {backdrop && (
          <DialogPrimitive.Overlay
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
            style={style}
          />
        )}
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[95%] -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-surface shadow-popover p-6 focus:outline-none max-h-[90vh] overflow-y-auto',
            sizeClasses,
            dialogClassName,
            contentClassName
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ModalHeader({ className = '', closeButton = false, children, ...props }) {
  return (
    <div className={cn('flex items-center justify-between pb-3 border-b border-border mb-3', className)} {...props}>
      <div className="flex-1">{children}</div>
      {closeButton && (
        <DialogPrimitive.Close className="rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 hover:bg-surface-muted focus:outline-none shrink-0 ml-2">
          <Icon icon="lucide:x" className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function ModalTitle({ className = '', ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn('text-base font-semibold leading-none tracking-tight text-foreground m-0', className)}
      {...props}
    />
  );
}

function ModalBody({ className = '', ...props }) {
  return <div className={cn('py-2 text-sm text-foreground', className)} {...props} />;
}

function ModalFooter({ className = '', ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-3 border-t border-border mt-3', className)}
      {...props}
    />
  );
}

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default Modal;
