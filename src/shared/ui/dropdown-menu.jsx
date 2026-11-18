import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Icon } from '@iconify/react';
import { cn } from '../../lib/utils';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef(({ className = '', inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-surface-muted data-[state=open]:bg-surface-muted',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <Icon icon="lucide:chevron-right" className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef(({ className = '', ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 text-foreground shadow-popover duration-150',
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef(({ className = '', sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-surface p-1 text-foreground shadow-popover',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef(({ className = '', inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1.5 text-sm outline-none transition-colors hover:bg-surface-muted focus:bg-surface-muted focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuSeparator = React.forwardRef(({ className = '', ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// Drop-in compatible Bootstrap Dropdown adapter using Radix
function DropdownAdapter({ children, className = '', ...props }) {
  return (
    <div className={cn('relative inline-block', className)}>
      <DropdownMenu {...props}>{children}</DropdownMenu>
    </div>
  );
}

function DropdownToggleAdapter({ children, asChild = false, as, className = '', ...props }) {
  if (asChild) {
    return <DropdownMenuTrigger asChild {...props}>{children}</DropdownMenuTrigger>;
  }
  const Comp = as || 'button';
  return (
    <DropdownMenuTrigger asChild>
      <Comp className={cn('inline-flex items-center justify-between', className)} {...props}>
        {children}
      </Comp>
    </DropdownMenuTrigger>
  );
}

function DropdownMenuAdapter({ children, align = 'end', className = '', ...props }) {
  return (
    <DropdownMenuContent align={align} className={className} {...props}>
      {children}
    </DropdownMenuContent>
  );
}

function DropdownItemAdapter({ children, className = '', ...props }) {
  return (
    <DropdownMenuItem className={className} {...props}>
      {children}
    </DropdownMenuItem>
  );
}

export const Dropdown = Object.assign(DropdownAdapter, {
  Toggle: DropdownToggleAdapter,
  Menu: DropdownMenuAdapter,
  Item: DropdownItemAdapter,
  Divider: DropdownMenuSeparator,
});

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};

export default Dropdown;
