// Tenant policy to impose limits on resource consumption for a tenant.
//
// Value: JSON-serialized ResourceLimitsPolicy.
export const resourceLimitsPolicyKey = "nsc.resource-limits";

// When ResourceLimitsPolicy is set, its fields default to zero.
// So to allow using a resource, corresponding field needs to be filled.
export interface ResourceLimitsPolicy {
	unit_minutes: number;
	builds: number;
	concurrency: MachineLimits;
}

export interface MachineLimits {
	cpu: number | string; // int64
	memory_mb: number | string; // int64
}
