import type { ModelLimitInfo } from './model-limit-info';
import type { ModelMetadata } from './model-metadata';
import type { ModelPrice } from './model-price';
import type { ModelPriceVO } from './model-price-vo';
import type { SceneContent } from './scene-content';
import type { TagsContent } from './tags-content';

/** Model detail response */
export interface ModelInfoDetailVO {
  /** Created at */
  createdAt?: string;
  /** Updated at */
  updatedAt?: string;
  /** Model id */
  modelId?: string;
  /** Canonical model key */
  modelKey?: string;
  /** Model alias */
  model?: string;
  /** Vendor model key */
  vendorModel?: string;
  /** Model name */
  name?: string;
  /** Model description */
  description?: string;
  /** Channel */
  channel?: string;
  /** Vendor */
  vendor?: string;
  /** Model type */
  modelType?: string;
  /** Model family */
  family?: string;
  /** Version */
  version?: string;
  /** Whether open source */
  openSource?: boolean;
  /** API endpoint */
  apiEndpoint?: string;
  /** Owner */
  ownedBy?: string;
  /** Scenes */
  scenes?: SceneContent;
  /** Tags */
  tags?: TagsContent;
  /** Limit info */
  limitInfo?: ModelLimitInfo;
  /** Model price info */
  priceInfo?: ModelPrice;
  /** Metadata */
  metadata?: ModelMetadata;
  /** Product support and parameter constraints */
  productSupportInfo?: Record<string, unknown>;
  /** Pricing rules */
  priceRules?: ModelPriceVO[];
  /** Default temperature */
  defaultTemperature?: number;
  /** Default top_p */
  defaultTopP?: number;
  /** Default frequency penalty */
  defaultFrequencyPenalty?: number;
  /** Default presence penalty */
  defaultPresencePenalty?: number;
  /** Status */
  status?: string;
  /** Usage count */
  usageCount?: number;
  /** Total tokens */
  totalTokens?: number;
  /** Average response time */
  avgResponseTime?: number;
}
