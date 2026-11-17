import type { ComponentType } from "react";

export interface TemplateEntry {
  component: ComponentType<any>;
  subject: string | ((data: Record<string, any>) => string);
  displayName?: string;
  previewData?: Record<string, any>;
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string;
}

import { template as adminInviteTemplate } from "./admin-invite";
import { template as appActivationTemplate } from "./app-activation";
import { template as serviceNoticeTemplate } from "./service-notice";
import { template as trustPackageTemplate } from "./trust-package";
import { template as businessCallRequestTemplate } from "./business-call-request";
import { template as leadAssignedTemplate } from "./lead-assigned";

export const TEMPLATES: Record<string, TemplateEntry> = {
  "admin-invite": adminInviteTemplate,
  "app-activation": appActivationTemplate,
  "service-notice": serviceNoticeTemplate,
  "trust-package": trustPackageTemplate,
  "business-call-request": businessCallRequestTemplate,
  "lead-assigned": leadAssignedTemplate,
};
