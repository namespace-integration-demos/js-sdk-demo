// Tenant policy to impose limits on resource consumption for a tenant.
//
// Value: JSON-serialized ResourceLimitsPolicy.
export const resourceLimitsPolicyKey = "nsc.resource-limits";

// When ResourceLimitsPolicy is set, its fields default to zero.
// So to allow using a resource, corresponding field needs to be filled.
export interface ResourceLimitsPolicy {
	concurrency: MachineLimits;
	monthly: TotalLimits;
}

export interface TotalLimits {
	unit_minutes: number;
	builds: number;
}

export interface MachineLimits {
	cpu: number | string; // int64
	memory_mb: number | string; // int64
}
