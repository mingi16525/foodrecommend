import { fastTierRecommender } from './fastTier';

export enum IntentType {
  SWIPE = 'swipe',
  FEED = 'feed',
  GROUP_ORDER = 'group_order',
  DATING = 'dating',
  TRIP_PLANNER = 'trip_planner',
}

export enum AiTier {
  FAST = 'FAST_TIER',
  MEDIUM = 'MEDIUM_TIER',
  DEEP = 'DEEP_TIER',
}

export interface ContextParams {
  location?: { lat: number; lng: number; geohash?: string };
  time?: Date;
  weather?: string;
  hasStrictConstraints?: boolean;
  budget?: number;
  membersCount?: number;
  multiDay?: boolean;
}

export interface RecommendationRequest {
  userId?: string;
  groupId?: string;
  intentType: IntentType;
  contextParams: ContextParams;
}

export interface RoutingDecision {
  tier: AiTier;
  reason: string;
}

export class DecisionComplexityEstimator {
  /**
   * Phân loại độ phức tạp của Request để điều hướng đến tầng AI tương ứng
   */
  public estimateAndRoute(req: RecommendationRequest): RoutingDecision {
    const { intentType, contextParams } = req;

    // 1. Phân loại Trip Planner -> Deep AI (LLM)
    if (intentType === IntentType.TRIP_PLANNER || contextParams.multiDay) {
      return {
        tier: AiTier.DEEP,
        reason: 'Trip planner requests require LLM Orchestrator for complex multi-day routing and RAG.'
      };
    }

    // 2. Phân loại Group/Dating/Strict Constraints -> Medium AI
    if (
      intentType === IntentType.GROUP_ORDER ||
      intentType === IntentType.DATING ||
      (contextParams.membersCount && contextParams.membersCount > 1) ||
      contextParams.hasStrictConstraints
    ) {
      return {
        tier: AiTier.MEDIUM,
        reason: 'Group orders or strict constraints require Pareto Aggregation and constraint solvers.'
      };
    }

    // 3. Mặc định (Swipe, Feed, Gợi ý cơ bản) -> Fast AI
    return {
      tier: AiTier.FAST,
      reason: 'Standard swipe/feed intent routed to Fast AI (Rule Engine + FAISS).'
    };
  }

  /**
   * Phương thức thực thi mock xử lý dựa trên Tier
   */
  public async handleRequest(req: RecommendationRequest): Promise<unknown> {
    const decision = this.estimateAndRoute(req);
    
    console.log(`[AI Routing] Request routed to ${decision.tier}. Reason: ${decision.reason}`);

    switch (decision.tier) {
      case AiTier.FAST:
        return await fastTierRecommender.getRecommendations(req.userId, req.contextParams);
      case AiTier.MEDIUM:
        // TODO: Gọi hàm từ mediumTier.ts
        throw new Error(`NotImplementedError: Medium Tier AI pipeline is not yet implemented.`);
      case AiTier.DEEP:
        // TODO: Gọi hàm từ tripPlanner.ts
        throw new Error(`NotImplementedError: Deep Tier AI pipeline is not yet implemented.`);
      default:
        throw new Error('Unknown AI Tier');
    }
  }
}
